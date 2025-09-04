from odoo import http
from odoo.http import request
import json
import urllib.parse

class Dashboard(http.Controller):
    @http.route('/redirect', auth='user', methods=['GET'], csrf=False)
    def redirect(self, **kwargs):
        model = kwargs.get('model')
        domain = kwargs.get('domain')
        if model and domain:
            if domain == 'undefined':
                domain = []
            else:
                domain = eval(domain)

            model_name = model.replace('vit.', '')
            print('-===========Model:', model_name)
            domain_json = json.dumps(domain)
            domain_encoded = urllib.parse.quote(domain_json)
            # Perform the redirect logic here
            action = request.env.ref(f'vit_kerma.action_{model_name}').read()[0]
            # url = f"/web#action={action['id']}&model={model}&view_type=list&domain={domain_encoded}"
            # return request.redirect(url)
            return action
            

        return {'error': 'Invalid parameters'}, 400


    @http.route('/gmaps/get_api_key', type='json', auth='user')
    def get_api_key(self):
        api_key = request.env['ir.config_parameter'].sudo().get_param('google_maps.api_key')
        if api_key:
            return api_key
        else:
            return False