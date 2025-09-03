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
                    this.updateList();
            });             
        });

    }

    async start() {
        console.log('starting...')
         
    }

    onMessage({ detail: notifications }) {
        console.log('onMessage notifications.length',notifications.length, 
            'this.state.isLoading', this.state.isLoading, 
            'this.state.activeRequests', this.state.activeRequests)

        notifications = notifications.filter(item => item.payload.channel === this.channel)
        if (notifications.length>0 && !this.state.isLoading){
            this.updateList();
        }
    }

    async updateList() {
        console.log('updateList....')
        this.state.activeRequests++;
        this.state.isLoading = true;
        try {
            // reload tampilan list saat ini dgn group, domain, order yang sama
            return await this.model.load({
                groupBy: this.props.groupBy,
                domain: this.props.domain,
                orderBy: this.props.orderBy
            })
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
