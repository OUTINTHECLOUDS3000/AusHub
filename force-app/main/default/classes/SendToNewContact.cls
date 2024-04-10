public class SendToNewContact {
    
    public static Id createAndSendEnvelope(Id mySourceId) {
        dfsle.Envelope myEnvelope = dfsle.EnvelopeService.getEmptyEnvelope(
            new dfsle.Entity(mySourceId)
        );
        
        
        Appointment__c myAppointment = [SELECT Name, Case_Origin__c, Case_Origin__r.Examinee_Name__c , Case_Origin__r.Examinee_Email__c, Examinee_Email__c FROM Appointment__c WHERE Id = :mySourceId LIMIT 1];
        Case myCase = [SELECT ID, Examinee_Name__c,Examinee_Email__c FROM CASE WHERE ID =: myAppointment.Case_Origin__c LIMIT 1];
       
        dfsle.Recipient myRecipient = dfsle.Recipient.fromSource( 
            myCase.Examinee_Name__c,
            myCase.Examinee_Email__c,
            null,
            'Signer 1',
            new dfsle.Entity(myCase.Id)
        );
        myEnvelope = myEnvelope.withRecipients(new List<dfsle.Recipient> { myRecipient });
        dfsle.UUID myTemplateId = dfsle.UUID.parse('0e29a285-e916-44c7-bbf3-bc16d6b775f5');
        dfsle.Document myDocument = dfsle.Document.fromTemplate(
            myTemplateId,
            'Services Framework Agreement'
        );
        myEnvelope = myEnvelope.withDocuments(
            new List<dfsle.Document> { myDocument }
        );
        myEnvelope = dfsle.EnvelopeService.sendEnvelope(
            myEnvelope,
            true
        );
        return myEnvelope.Id;
    }
    
    @future(callout = true)
    public static void sendEnvelopeInFuture(Id mySourceId) {
        createAndSendEnvelope(mySourceId);
    }
    
    @InvocableMethod
    public static List<String> sendEnvelope(List<Appointment__c> record) {
        Appointment__c mySource = record.get(0);
        sendEnvelopeInFuture(mySource.Id);
        return Null;
    }
}