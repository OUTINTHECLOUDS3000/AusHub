import { LightningElement,track,wire } from 'lwc';
import { getPicklistValuesByRecordType,getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import getExperts from '@salesforce/apex/SearchController.getExperts';
import LightningAlert from 'lightning/alert';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ExpertSearchComponent extends LightningElement {

    @track speciality;
    @track specialityOptions = [];
    renderFlow = false;
    @track location;
    @track locationOptions = [];
    @track name = '';
    @track reference = '';
    @track TelehealthOnly = false;
    @track searchResults;
    isDataLoaded = false;
    flowApiName = "Create_an_Appointment"; // api name of your flow

	// Setting flow input variables
	accountId = "<--add account id here-->";
	flowInputVariables = [
		{
			name: "accountId",
			type: "String",
			value: this.accountId,
		},
	];

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT.objectApiName }) // Replace ObjectName with your object API name
    objectInfo;

    @wire(getPicklistValuesByRecordType, {
        objectApiName: CONTACT_OBJECT.objectApiName,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    })
    wiredPicklistValues({ error, data }) {
        if (data) {
            console.log('---data--' +JSON.stringify(data));
            const specialityPicklistValues = data.picklistFieldValues['Area_of_Speciality__c'];
            const locationPicklistValues = data.picklistFieldValues['Locations_of_Operation__c'];

            this.specialityOptions = this.mapPicklistOptions(specialityPicklistValues);
            this.specialityOptions[0] = {label : "Select an Option", value : ''};
            this.locationOptions = this.mapPicklistOptions(locationPicklistValues);
            this.locationOptions[0] = {label : "Select an Option", value : ''};
        } else if (error) {
            // Handle error
            console.log('---data--' +JSON.stringify(error));
        }
    }

    mapPicklistOptions(picklistValues) {
        
        return picklistValues.values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }

    handleLocationChange(event) {
        this.location = event.target.value;
    }

    handleSpecialityChange(event) {
        this.speciality = event.target.value;
    }

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleTelehealthOnly(event) {
        this.TelehealthOnly = event.target.checked;
    }

    handleSearch() {
        // Call Apex method to retrieve search results based on input values
        // Example:
        if(!this.speciality && !this.location  && !this.name && !this.TelehealthOnly)
        {
         
   
              LightningAlert.open({
                    message: 'Select search criteria to find an expert',
                    theme: 'error', // a red theme intended for error states
                    label: 'Error!', // this is the header text
                });
                //Alert has been closed
           
            return;
        }
        this.isDataLoaded = true;
        getExperts({
            areaOfSpeciality: this.speciality,
            locationsOfOperation: this.location,
            contactName: this.name,
            TelehealthOnly : this.TelehealthOnly
        })
        .then(result => {
            console.log('---Result in Expert Search---'+ JSON.stringify(result));
            this.searchResults = result.map(obj => ({ ...obj, recordURL: 'https://'+location.host+'/'+ obj.Id }))
        
            this.isDataLoaded = false;
            // Mock data for demonstration
    //    this.searchResults = [
    //     { id: '1', location: 'New York', specialty: 'Cardiology', fullContactName: 'Dr. John Doe', nextAvailableAppointment: new Date()+1 },
    //     { id: '2', location: 'Los Angeles', specialty: 'Dermatology', fullContactName: 'Dr. Jane Smith', nextAvailableAppointment: new Date()+1 },
    //     // Add more records as needed
    // ];
        })
        .catch(error => {
            // Handle error
            console.log('---Error in Expert Search---'+ JSON.stringify(error));
            this.isDataLoaded = false;
        })
       .finally()
       { }
    }
    

    get columns() {
        return [
            { label: 'Name', type: 'url', fieldName: 'recordURL' ,
            typeAttributes: {label: { fieldName: 'fullContactName' }, target: '_blank'}},
            { label: 'Speciality', fieldName: 'specialty' },
            { label: 'Location', fieldName: 'location', fixedWidth: 110 },
            { label: 'Next Available Appointment', type: "date", fieldName: 'nextAvailableAppointment' , typeAttributes: {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }},
            { label: 'Telehealth Only', fieldName: 'TelehealthOnly',fixedWidth: 130, type :'boolean' },
            {
                type: "button", label: 'Book an Appointment', typeAttributes: {
                    label: 'Book an Appointment',
                    name: 'Book_Appointment',
                    title: 'Book an Appointment',
                    disabled: false,
                    value: 'Book an Appointment',
                    iconPosition: 'center',
                    iconName:'utility:service_appointment',
                    variant:'Brand'
                }
            }
        ];
    }

    selectedExpertId;
    callRowAction(event) {
        const recId = event.detail.row.Id;
        this.selectedExpertId = recId;
        const actionName = event.detail.action.name;
        if (actionName === 'Book_Appointment') {
           this.renderFlow = true;
        }
    }

    // do something when flow status changed
	handleFlowStatusChange(event) {
		console.log("flow status", event.detail.status);
		if (event.detail.status === "FINISHED") {
			this.dispatchEvent(
				new ShowToastEvent({
					title: "Success",
					message: "Flow Finished Successfully",
					variant: "success",
				})
			);
            this.hideModalBox();
		}
	}
    hideModalBox() {  
        this.renderFlow = false;
    }

    get inputVariables() {
        return [
            {
                name: 'expertId',
                type: 'String',
                value: this.selectedExpertId
            }
        ];
    }
}