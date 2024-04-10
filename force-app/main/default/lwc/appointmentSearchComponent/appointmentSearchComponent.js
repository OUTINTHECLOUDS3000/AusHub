import { LightningElement,track } from 'lwc';
import getAppointments from '@salesforce/apex/SearchController.getAppointments';
import LightningAlert from 'lightning/alert';
export default class AppointmentSearchComponent extends LightningElement {

    @track examineeName = '';
    @track caseReference = '';
    @track date = '';
    @track specialist = '';
    @track searchResults;
    isDataLoaded = false;

    handleExamineeNameChange(event) {
        this.examineeName = event.target.value;
    }

    handleCaseReferenceChange(event) {
        this.caseReference = event.target.value;
    }

    handleDateChange(event) {
        this.date = event.target.value;
    }

    handleSpecialistChange(event) {
        this.specialist = event.target.value;
    }

    handleSearch() {
        // Call Apex method to retrieve search results based on input values
        // Example:
        if(!this.examineeName && !this.caseReference  && !this.date && !this.specialist)
        {
         
   
              LightningAlert.open({
                    message: 'Select search criteria to find an Appointment',
                    theme: 'error', // a red theme intended for error states
                    label: 'Error!', // this is the header text
                });
                //Alert has been closed
           
            return;
        }
       // if(!this.date) this.date = null;
        this.isDataLoaded = true;
        getAppointments({ 
            examineeName: this.examineeName, 
            caseReference: this.caseReference, 
            appointmentDate: this.date.toString(), 
            specialist: this.specialist 
        })
            .then(result => {
                console.log('---Result in Appointment Search---'+ JSON.stringify(result));
                if(result)
                {
                this.searchResults = result.map((item)=> {
                    return {... item, Area_of_Speciality__c : item.Expert_Name__r.Area_of_Speciality__c,
                        expertURL : 'https://'+location.host+'/'+ item.Expert_Name__c,
                        appointmentURL : 'https://'+location.host+'/'+ item.Id
                    };
                });
            }
                this.isDataLoaded = false;
            })
            .catch(error => {
                // Handle error
                this.isDataLoaded = false;
                console.log('---Error in Appointment Search---'+ JSON.stringify(error));
            });
       
    //    // Mock data for demonstration
    //    this.searchResults = [
    //        { id: '1', examineeName: 'John Doe', expertName: 'Ben Chapman', date: '2024-03-23', specialist: 'Cardiologist' },
    //        { id: '2', examineeName: 'Jane Smith', expertName: 'John Dug', date: '2024-03-24', specialist: 'Dermatologist' },
    //        // Add more records as needed
    //    ];
    }

    get columns() {
        return [
            { label: 'Name', type: 'url', fieldName: 'appointmentURL' ,
            typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}},
            { label: 'Examinee Name', fieldName: 'Examinee_Full_Name__c' },
            { label: 'Medical Expert', type: 'url', fieldName: 'expertURL' ,
            typeAttributes: {label: { fieldName: 'Expert_FullName__c' }, target: '_blank'}},
            { label: 'Specialist/Expert', fieldName: 'Area_of_Speciality__c' },
            { label: 'Location', fieldName: 'Examinee_Location__c' },
            { label: 'Date and Time of Appointment', fieldName: 'Appointment_Start_Date_and_Time__c',type: 'date',
            typeAttributes:{day:'numeric',month:'short',year:'numeric',
            hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true} },
           
        ];
    }
}
