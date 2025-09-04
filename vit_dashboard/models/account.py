# -*- coding: utf-8 -*-

from odoo import models, api
import logging
_logger = logging.getLogger(__name__)
from .tools import domain_to_sql, process_domain

class Accountmove(models.Model):
    _inherit = 'account.move'


    @api.model
    def get_statistics(self, domain=None, field=None):
    
        return {
            'total': 0,
        }
    
    