# -*- coding: utf-8 -*-

from odoo import models, fields, api


import logging
_logger = logging.getLogger(__name__)


class MrpWorkorder(models.Model):
    _name = 'mrp.workorder'
    _inherit = 'mrp.workorder'

    from_iot = fields.Boolean('From IoT')

    def write(self, vals):
        result = super(MrpWorkorder, self).write(vals)
    
        if 'qty_production' in vals or 'qty_produced' in vals or 'state' in vals:
            self.send_bus()
    
        return result
    

    def button_pending(self):
        super(MrpWorkorder, self).button_pending()    
        self.send_bus()

    def button_start(self):
        super(MrpWorkorder, self).button_start()
        self.send_bus()
        
    def button_finish(self):
        super(MrpWorkorder, self).button_finish()
        self.send_bus()
        
    def send_bus(self):


        # channel, notification_type, message
        vals={'id':self.id}

        # Send the live data to the frontend using the bus service
        channel = 'mrp.workorder'
        # channel = 'discuss.channel/new_message'
        
        message = {
            "data": vals,
            "channel": channel
        }
        _logger.info(f'sending bus...notification, channel={channel}')
        self.env["bus.bus"]._sendone(channel, "notification" , message)
        return True
