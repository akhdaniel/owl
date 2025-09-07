/** @odoo-module **/

import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { useService } from "@web/core/utils/hooks";
import { fuzzyLookup } from "@web/core/utils/search";
import { _t } from "@web/core/l10n/translation";

import { Component, onWillStart, useState } from "@odoo/owl";

export class PartnerSelector extends Component {
    setup() {
        this.orm = useService("orm");

        this.state = useState({
            value: this.props.value || "", // Initialize the input value
        });

        onWillStart(async () => {
            if (!this.props.partners) {
                this.partners = await this._fetchAvailablePartners();
            } else {
                this.partners = await this.orm.call("res.partner", "display_name_for", [
                    this.props.partners,
                ]);
            }

            this.partners = this.partners.map((record) => ({
                id: record.id, // Use the record's id from the server
                label: record.display_name, // Use the record's name as the label
            }));
        });
    }

    get placeholder() {
        return _t("Search Partner...");
    }

    get sources() {
        // console.log("optionsSource", this.optionsSource);
        return [this.optionsSource];
    }

    get optionsSource() {
        return {
            placeholder: _t("Loading..."),
            // options: this.loadOptionsSource.bind(this),
            options: (request) => this.loadOptionsSource(request),

        };
    }

    onSelect(option) {
        // console.log("Selected option:", option);
        const obj = Object.getPrototypeOf(option);
        // Update the input value with the selected unit's label
        this.state.value = obj.label;

        // Notify the parent component about the selected unit
        this.props.onPartnerSelected({
            id: obj.id,
            name: obj.label,
        });
    }

    onInput(event) {
        const inputValue = event.target.value;
        this.state.value = inputValue; // Update the input value as the user types

        if (!inputValue.trim()) {
            console.log("Reset selection values when input is empty", inputValue);
            if (this.props.onPartnerSelected) {
                this.props.onPartnerSelected(null); // Notify parent to reset the selection
            }
        }
    }

    filterPartners(name) {
        if (!name) {
            return this.partners;
        }
        return fuzzyLookup(name, this.partners, (unit) => unit.label);
    }

    loadOptionsSource(request) {
        const options = this.filterPartners(request);

        if (!options.length) {
            options.push({
                label: _t("No records"),
                classList: "o_m2o_no_result",
                unselectable: true,
            });
        }
        return options;
        
    }

    async _fetchAvailablePartners() {
        const result = await this.orm.searchRead(
            "res.partner",
            [],
            ["id", "name","display_name"]
        );
        return result || [];
    }


}

PartnerSelector.template = "web.PartnerSelector";
PartnerSelector.components = { AutoComplete };
PartnerSelector.props = {
    onPartnerSelected: Function,
    id: { type: String, optional: true },
    value: { type: String, optional: true },
    partners: { type: Array, optional: true },
};
