# -*- coding: utf-8 -*-

from odoo import models, fields, api
import logging
_logger = logging.getLogger(__name__)

class StockMove(models.Model):
    _name = "stock.move"
    _inherit = "stock.move"

    def _action_done(self, cancel_backorder=False):
        _logger.info('action_move..')
        moves = super(StockMove, self)._action_done(cancel_backorder)
        _logger.info(f'res={moves}')
        for mv in moves:
            mv.send_bus()
        return moves
    
    
    def send_bus(self):
        product = self.product_id
        _logger.info(f'self.product_id={product}')
        if product:
            total_qty_available = product.product_tmpl_id.qty_available # ambil total qty level product template
            _logger.info(f'product {product.name} qty={total_qty_available}')

            vals = {
                'id':product.id, 
                'qty_available': total_qty_available,
                'name': product.name,
            }

            # Send the live data to the frontend using the bus service
            channel = 'product.template'
            
            message = {
                "data": vals,
                "channel": channel
            }
            _logger.info(f'sending bus...notification, channel={channel}, product={product.name}')
            self.env["bus.bus"]._sendone(channel, "notification" , message)
