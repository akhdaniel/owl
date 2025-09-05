# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class Accountmove(models.Model):
    _inherit = 'account.move'


    @api.model
    def get_statistics(self, domain=None, field=None):
        domain = domain or []  # Use an empty domain if none is provided
        cr = self.env.cr

        if field == 'total_account_move_by_stage':
            domain = process_domain(domain, self)            
            where_clause, params = domain_to_sql(domain, self.env['account.move'])
            sql = f"""
                SELECT state, COUNT(*) as count
                FROM account_move 
                WHERE 1=1 {where_clause}
                GROUP BY state
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_account_move_by_stage = {item['state']: item['count'] for item in res}
            return {'total_account_move_by_stage': total_account_move_by_stage}   
         
        else:   
            return {
                'total_account_move_by_stage': {},
            }