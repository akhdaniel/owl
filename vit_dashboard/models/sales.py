# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class SalesOrder(models.Model):
    _inherit = 'sale.order'


    @api.model
    def get_statistics(self, domain=None, field=None, page_size=None, offset=None):
        domain = domain or []  # Use an empty domain if none is provided
        cr = self.env.cr

        if field == 'total_sale_order':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['sale.order'])
            sql = f"""
                SELECT SUM(amount_total) as total
                FROM sale_order 
                WHERE 1=1 {where_clause}
                GROUP BY state
            """
            cr.execute(sql, params)
            res = cr.dictfetchone()
            total_sale_order = {'total': res['total'] if res else 0}
            return total_sale_order

        elif field == 'total_sale_order_by_state':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['sale.order'])
            sql = f"""
                SELECT state, COUNT(*) as count
                FROM sale_order 
                WHERE 1=1 {where_clause}
                GROUP BY state
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_sale_order_by_state = {item['state']: item['count'] for item in res}
            return {'total_sale_order_by_state': total_sale_order_by_state}    
        
        elif field == 'total_sale_order_by_country':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['sale.order'])
            sql = f"""
                SELECT 
                    res_country.name->>'en_US' as country, 
                    COUNT(*) as count
                FROM sale_order 
                LEFT JOIN res_partner ON sale_order.partner_id = res_partner.id
                LEFT JOIN res_country ON res_partner.country_id = res_country.id 
                WHERE 1=1 {where_clause}
                GROUP BY res_country.name
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_sale_order_by_country = {item['country']: item['count'] for item in res}
            return {'total_sale_order_by_country': total_sale_order_by_country}           
        
        elif field == 'total_sale_order_by_month':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['sale.order'])
            sql = f"""
                SELECT 
                    TO_CHAR(sale_order.date_order, 'Month') as month,
                    COUNT(*) as count
                FROM sale_order 
                WHERE 1=1 {where_clause}
                GROUP BY sale_order.date_order
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_sale_order_by_month = {item['month']: item['count'] for item in res}
            return {'total_sale_order_by_month': total_sale_order_by_month}            
        
        elif field == 'total_sale_order_by_year':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['sale.order'])
            sql = f"""
                SELECT 
                    EXTRACT(YEAR FROM sale_order.date_order) as year,
                    COUNT(*) as count
                FROM sale_order 
                WHERE 1=1 {where_clause}
                GROUP BY sale_order.date_order
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_sale_order_by_year = {item['year']: item['count'] for item in res}
            return {'total_sale_order_by_year': total_sale_order_by_year}     
        
        else:   
            return {
                'error':'undefined field'
            }
    

