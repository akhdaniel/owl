/** @odoo-module **/

import { useService } from "@web/core/utils/hooks";

import { fuzzyLookup } from "@web/core/utils/search";
import { _t } from "@web/core/l10n/translation";

const { Component, onWillStart, onMounted, useRef, useState } = owl

export class KeywordSearch extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            value: this.props.value || "",
        });

        onWillStart(async () => {
            
        });
    }

    get placeholder() {
        return _t("Search anything...");
    }



    // filterMitras(name) {
    //     if (!name) {
    //         return this.mitras;
    //     }
    //     return fuzzyLookup(name, this.mitras, (unit) => unit.label );
    // }

    // loadOptionsSource(request) {
    //     const options = this.filterMitras(request);

    //     if (!options.length) {
    //         options.push({
    //             label: _t("No records"),
    //             classList: "o_m2o_no_result",
    //             unselectable: true,
    //         });
    //     }
    //     return options;
    // }

    onKeyUp(event) {
        if (event.key === "Enter") {
            if (this.props.onKeywordSearchEnter) {
                this.props.onKeywordSearchEnter(this.state.value); // Propagate the value to the parent
            }
        }
    }
    onChange(event) {
        this.state.value = event.target.value;
    }
    onKeyDown(event) {
        this.state.value = event.target.value;
    }

}

KeywordSearch.template = "vit_dashboard.KeywordSearch";
KeywordSearch.props = {
    onKeywordSearchEnter: Function,
    value: { type: String, optional: true },
};
