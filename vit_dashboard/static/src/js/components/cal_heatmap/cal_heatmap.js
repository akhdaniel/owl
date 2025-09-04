/** @odoo-module */

import { loadJS, loadCSS } from "@web/core/assets";
import { Component, onWillStart, useRef,useState, onMounted, onWillUnmount } from "@odoo/owl";
import { useService } from '@web/core/utils/hooks';
export class CalHeatMap extends Component {


    static props = {
        title: {
            type: String,
            optional: true
        }
    }

    setup() {
        this.orm = useService("orm")

        this.state = useState({
            cal_data: null,
            unit_kerja_id: null
        })
        onWillStart(() => loadJS(["/vit_dashboard/static/lib/gchart-loader.js"]));
        onMounted(() => {
            this.renderCalHeatMap();
        });
        onWillUnmount(() => {
            const chartDiv = document.getElementById("calendar_basic");
            if (chartDiv) {
              chartDiv.innerHTML = ""; // Clear the container
            }
            this.chart = null; // Remove the reference to the chart
        });
    }

    async getData(){
        //model, domain, fields, groupby, kwargs = {}
        let domain = []
        if (this.state.unit_kerja_id != null) {
            domain = [['unit_kerja_id','=',this.state.unit_kerja_id]]
        }

        this.state.cal_data = await this.orm.readGroup('vit.kerjasama', domain, ["id"], ["create_date:day"] )
        const data = this.state.cal_data.map(d=>{ return [ new Date(d['create_date:day']), d['create_date_count']]})
        return data

    }
    async drawChart() {
       var dataTable = new google.visualization.DataTable();
       dataTable.addColumn({ type: 'date', id: 'Date' });
       dataTable.addColumn({ type: 'number', id: 'Won/Loss' });
       dataTable.addRows(await this.getData());

       this.chart = new google.visualization.Calendar( document.getElementById("calendar_basic") ) ;

       var options = {
         title: "Input Kerjasama",
         height: 236,
         calendar: {
            cellSize: 11,
            cellColor: {
                strokeOpacity: 0.5,
                strokeWidth: 1,
            }
         },
       };

       this.chart.draw(dataTable, options);
   }

    renderCalHeatMap() {
        google.charts.load("current", {packages:["calendar"]});
        google.charts.setOnLoadCallback( ()=>this.drawChart() );
    }

    static reloadChart(unit){
        console.log('reload chart', unit)
    }


}
CalHeatMap.template = "vit_dashboard.CalHeatMap"
