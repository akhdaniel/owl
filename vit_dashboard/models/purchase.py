# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'


    @api.model
    def get_statistics(self, domain=None, field=None):
        domain = domain or []  # Use an empty domain if none is provided
        cr = self.env.cr

        if field == 'total_purchase_order_by_state':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['purchase.order'])
            sql = f"""
                SELECT state, COUNT(*) as count
                FROM purchase_order 
                WHERE 1=1 {where_clause}
                GROUP BY state
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_purchase_order_by_state = {item['state']: item['count'] for item in res}
            return {'total_purchase_order_by_state': total_purchase_order_by_state}     
        else:   
            return {
                'total_purchase_order_by_state': {},
            }