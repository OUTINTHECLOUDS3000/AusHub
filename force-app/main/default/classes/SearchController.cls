public with sharing class SearchController {
    
    @AuraEnabled
    public static List<ExpertWrapper> getExperts(String areaOfSpeciality, String locationsOfOperation, String contactName,boolean TelehealthOnly) {
        string recordType = 'Medical Expert';
        String query = 'SELECT Id, Name, Area_of_Speciality__c, Telehealth_Only__c, Locations_of_Operation__c FROM Contact WHERE RecordType.Name =:recordType ';

        if (!String.isEmpty(areaOfSpeciality)) {
            query += ' AND Area_of_Speciality__c = \'' + areaOfSpeciality + '\'';
        }
        if (!String.isEmpty(locationsOfOperation)) {
            query += ' AND Locations_of_Operation__c = \'' + locationsOfOperation + '\'';
        }
        if (!String.isEmpty(contactName)) {
            query += ' AND Name LIKE \'%' + contactName + '%\'';
        } 
        if (TelehealthOnly) {
            query += ' AND Telehealth_Only__c =  ' + TelehealthOnly ;
        } 
        
        system.debug('Telehealth' + query);
        Map<Id,ExpertWrapper> experts = new Map<Id,ExpertWrapper>();
        Set<Id> expertIds = new Set<Id>();
        for(Contact expert : Database.query(query))
        {
            expertIds.add(expert.Id);
            ExpertWrapper expertData = new ExpertWrapper(expert.Id,expert.Name,expert.Area_of_Speciality__c,expert.Locations_of_Operation__c,null,expert.Telehealth_Only__c);
            experts.put(expert.Id,expertData);
        }

        Map<Id, Date> maxAppointmentDatesMap = new Map<Id, Date>();
        if(expertIds.size() > 0)
        {
        for (AggregateResult result : [SELECT Expert_Name__c ,Min(Appointment_Start_Date_and_Time__c) maxAppointmentDate 
                                    FROM Appointment__c 
                                    WHERE Expert_Name__c  IN :expertIds 
                                    AND RecordType.DeveloperName  = 'Appointment_Availability'
                                    AND Appointment_Start_Date_and_Time__c >= TODAY
                                    GROUP BY Expert_Name__c ]) {
            Id contactId = (Id)result.get('Expert_Name__c');
            system.debug('appointmentDate' + ((DateTime)result.get('maxAppointmentDate')));
            DateTime maxAppointmentDate = ((DateTime)result.get('maxAppointmentDate'));
            if(experts.containskey(contactId))
            {
                experts.get(contactId).nextAvailableAppointment = maxAppointmentDate;
            }
        }
    }
        return experts.values();
    }
    @AuraEnabled
    public static List<Appointment__c> getAppointments(String examineeName, String caseReference, String appointmentDate, String specialist) {
        String recordType = 'Appointment';
        String query = 'SELECT Id, Expert_Name__c, Name, Examinee_Location__c, Appointment_Start_Date__c,Expert_Name__r.Area_of_Speciality__c,Appointment_Start_Date_and_Time__c, Examinee_Full_Name__c,Reference_Claim_Number__c,Expert_FullName__c FROM Appointment__c WHERE RecordType.Name =:recordType ';


        if (!string.isEmpty(appointmentDate)) {
            query += ' AND Appointment_Start_Date__c = ' + appointmentDate;
        }
        if (!String.isEmpty(examineeName)) {
            query += ' AND Examinee_Full_Name__c LIKE \'%' + examineeName + '%\'';
        }
        if (!String.isEmpty(caseReference)) {
            query += ' AND Reference_Claim_Number__c = \'' + caseReference + '\'';
        }
        if (!String.isEmpty(specialist)) {
            query += ' AND Expert_FullName__c LIKE \'%' + specialist + '%\'';
        }
        system.debug('-- Appointment Query--' + query);
        return Database.query(query);
    }

    public class ExpertWrapper {
        @AuraEnabled
        public String fullContactName { get; set; }
        @AuraEnabled
        public String specialty { get; set; }
        @AuraEnabled
        public String location { get; set; }
        @AuraEnabled
        public DateTime nextAvailableAppointment { get; set; }
        @AuraEnabled
        public boolean TelehealthOnly { get; set; }
        @AuraEnabled
        public String Id{ get; set; }
    
        public ExpertWrapper(String Id, String fullContactName, String specialty, String location, DateTime nextAvailableAppointment,boolean TelehealthOnly	) {
            this.fullContactName = fullContactName;
            this.Id = Id;
            this.specialty = specialty;
            this.location = location;
            this.TelehealthOnly = TelehealthOnly;
            this.nextAvailableAppointment = nextAvailableAppointment;

        }
    }
}