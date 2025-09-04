# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class Lead(models.Model):
    _inherit = 'crm.lead'


    @api.model
    def get_statistics(self, domain=None, field=None):
        # print('domain', domain)
        domain = domain or []  # Use an empty domain if none is provided
        cr = self.env.cr

        if field == 'total_lead_by_stage':
            domain = process_domain(domain, self)                    
            where_clause, params = domain_to_sql(domain, self.env['crm.lead'])
            sql = f"""
                SELECT s.sequence,s.name->>'en_US' as stage_name, COUNT(*) as count
                FROM crm_lead l
                LEFT JOIN crm_stage s ON s.id = l.stage_id
                WHERE s.name->>'en_US' <> 'Penandatangan' and 1=1 {where_clause}
                GROUP BY s.sequence,s.name
                ORDER BY s.sequence
            """
            cr.execute(sql, params)
            res = cr.dictfetchall()
            total_lead_by_stage = {}
            for item in res:
                stage_name = item['stage_name']
                total_lead_by_stage[stage_name] = {"Jumlah": item["count"]}

            return {'total_lead_by_stage': total_lead_by_stage}
        
        
        
        else:
            return {'error': 'unknown field'}


