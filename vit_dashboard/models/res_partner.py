# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class ResPartner(models.Model):
    _inherit = 'res.partner'


    @api.model
    def get_statistics(self, domain=None, field=None):
    
        return {
            'total': 0,
        }
    
    

    def get_locations(self, domain=None):
        domain = domain or []  
        domain = process_domain(domain, self)
        res = self.search_read(domain, fields=["id","name","partner_latitude","partner_longitude"])
        return res
