# -*- coding: utf-8 -*-
from odoo import http


class VitProgressbarTimer(http.Controller):
    @http.route('/send_print_data/<model("mrp.workorder"):wo>', auth='public')
    def send_print_data(self, wo=None, **kw):
        wo.send_print_data()
        
    @http.route('/get_print_data/<model("mrp.workorder"):wo>', auth='public')
    def get_print_data(self, wo=None, **kw):
        if wo:
            wo.is_printed = True
            return wo.print_data
        else:
            return ''
        

    

