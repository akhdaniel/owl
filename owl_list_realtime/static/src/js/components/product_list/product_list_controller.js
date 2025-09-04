/** @odoo-module  */

import { ListController } from "@web/views/list/list_controller";
import {  onWillStart, useState, onWillUnmount, onMounted} from "@odoo/owl";
import { listView } from "@web/views/list/list_view";
import { registry } from "@web/core/registry";

export class WoListController extends ListController {

    setup() {
        super.setup();
        console.log('============== setup WOListController in addon...===========')
        this.state = useState({
            isLoading: false,
        });
        this.channel = "product.template"
        this.busService = this.env.services.bus_service

        // Clean up the interval when the component is destroyed
        onWillUnmount(() => {
            console.log('onWillUnmount')
            this.busService.removeEventListener("notification", this.listener)
        });

        onWillStart(()=>{
            console.log('onWillStart..')
            this.busService.addChannel(this.channel)
            this.busService.subscribe("notification", (payload) => {
                console.log('subscribed channel=',this.channel,'payload=', payload)
                //is loading protek double loading view list
                if (payload.channel==this.channel && !this.state.isLoading)
                    this.updateList(payload);
            });             
        });

    }



    async updateList(payload) {
        console.log('updateList....', payload)
        this.state.activeRequests++;
        this.state.isLoading = true;
        try {
            // update kolom qty onhand
            const name = payload.data.name 
            const qty_available = payload.data.qty_available 
            const name_col_index = 3 // for mobile device it is 2
            const row = document.evaluate(
                '//tr[td['+name_col_index+'][text()="'+name+'"]]', // mirik spt xpath, tapi langsung di JS
                document, 
                null, 
                XPathResult.FIRST_ORDERED_NODE_TYPE, 
                null
            ).singleNodeValue;

            // Update the 8th td (qty_available column)
            if (row) {
                const eighthTd = row.querySelector('td:nth-child(8)');
                if (eighthTd) {
                    eighthTd.textContent = qty_available; // format number in quiz
                    // If you need to update the actual data attribute as well:
                    eighthTd.setAttribute('data-tooltip', qty_available);
                }
            }
        } catch(e){
            console.error(e)
        } finally {
            this.state.activeRequests--;
            this.state.isLoading = this.state.activeRequests > 0;
        }
    }
}

export const woListView = {
    ...listView,
    Controller: WoListController, // ganti controller list dgn yg baru
};

//register views list class
registry.category("views").add("product_list", woListView);
