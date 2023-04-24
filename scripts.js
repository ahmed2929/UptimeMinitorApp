const Viewer =require("./DB/Schema/Viewers")
const mongoose =require("mongoose")
/**
 * im adding new filds to viewer collection but those filds values is bolean and its value will be based on an old fild in the schema
 * based on the following rules 
 * if CanWriteMeds = true will add CanDeleteAllMeds,CanEditAllMeds and set them to true else will add them and set them to false
 * if CanWriteSymptoms =true will add CanDeleteSymptoms,CanEditSymptoms,CanAddSymptoms and set them to true else will add them and set them to false
 * will add CanSuspendDoses and set them to true
 * if CanWriteDoses =true will add CanAddNewDose,CanEditDoses,CanChangeDoseStatus and set them to true else will add them and set them to false
* add +CanShareAllMeds,CanShareAllSymptoms,CanShareAllDoses,CanShareAllInfo and set them to false
*inside every document there will be an array called CanReadSpacificMeds the objects inside this array if CanWrite = true will add CanEdit,CanDelete and set them to true else will add them and set them to false
*add the following fileds CanShareMedInfo,CanShareDosesInfo and set them to false
 */
//Connect to DB

/// update permissions 
Viewer.find().populate('ViewerProfile').populate('DependentProfile').exec(function(err, viewers) {
  if (err) {
    console.log(err);
  } else {
    viewers.forEach(function(viewer) {
      const IsInternal=viewer.DependentProfile.MasterProfiles.includes(viewer.ViewerProfile._id)
      viewer.CanDeleteAllMeds = viewer.CanWriteMeds === true ? true : false;
      viewer.CanEditAllMeds = viewer.CanWriteMeds === true ? true : false;
      viewer.CanDeleteSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanEditSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanAddSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanSuspendDoses = IsInternal;
      viewer.CanAddNewDose = viewer.CanWriteDoses === true ? true : false;
      viewer.CanEditDoses = viewer.CanWriteDoses === true ? true : false;
      viewer.CanChangeDoseStatus = IsInternal//viewer.CanWriteDoses === true ? true : false;
      viewer.CanShareAllMeds = false;
      viewer.CanShareAllSymptoms = false;
      viewer.CanShareAllDoses = false;
      viewer.CanShareAllInfo = false;

    
        for (let i = 0; i < viewer.CanReadSpacificMeds.length; i++) {
          if (viewer.CanReadSpacificMeds[i].CanWrite === true) {
            viewer.CanReadSpacificMeds[i].CanEdit = true;
            viewer.CanReadSpacificMeds[i].CanDelete = true;
          }else{
              viewer.CanReadSpacificMeds[i].CanEdit = false;
              viewer.CanReadSpacificMeds[i].CanDelete = false;
          }
          viewer.CanReadSpacificMeds[i].CanShareMedInfo=false
          viewer.CanReadSpacificMeds[i].CanShareDosesInfo=false
          //doses
          viewer.CanReadSpacificMeds[i].CanChangeDoseStatus=IsInternal
          viewer.CanReadSpacificMeds[i].CanEditDoses=IsInternal
          viewer.CanReadSpacificMeds[i].CanAddNewDose=true
          viewer.CanReadSpacificMeds[i].CanSuspendDoses=IsInternal
          
         
        }
      

      viewer.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
});


// update notification

Viewer.find({}, function(err, viewers) {
  if (err) {
    console.log(err);
  } else {
    viewers.forEach(function(viewer) {
      viewer.NotificationSettings.DoseNotify30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.DoseNotify60m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.MedRefile = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewSymptom = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewBloodGlucoseReading = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodGlucoseReminder30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodGlucoseReminder60m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewBloodPressureReading = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodPressureReminder30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodPressureReminder60m = viewer.notify === true ? true : false;
      viewer.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
});


const patients = [
  {
  firstName: 'Ava',
  lastName: 'Jackson',
  dateOfBirth: '6/3/2012',
  condition: 'Cerebral Palsy',
  conditionSummary: 'Muscle spasticity, speech difficulties',
  medications: [{ name: 'Medication O', dose: '5mg', time: 'Morning' },
  { name: 'Medication P', dose: '2.5mg', time: 'Evening' }]
  },
  {
    firstName: 'Liam',
    lastName: 'Harris',
    dateOfBirth: '11/18/2009',
    condition: 'Autism Spectrum Disorder',
    conditionSummary: 'Sensory sensitivities, repetitive behaviors',
    medications: [
      { name: 'Medication Q', dose: '10mg', time: 'Morning' },
      { name: 'Medication R', dose: '7.5mg', time: 'Evening' },
      { name: 'Medication S', dose: '2.5mg', time: 'Bedtime' }
    ]
  },
  {
    firstName: 'Harper',
    lastName: 'Scott',
    dateOfBirth: '4/21/2006',
    condition: 'Intellectual Disability',
    conditionSummary: 'Developmental delay, speech difficulties',
    medications: [
      { name: 'Medication T', dose: '15mg', time: 'Morning' },
      { name: 'Medication U', dose: '5mg', time: 'Afternoon' }
    ]
  },
  {
    firstName: 'Ethan',
    lastName: 'Thompson',
    dateOfBirth: '9/10/2013',
    condition: 'Attention Deficit Hyperactivity Disorder (ADHD)',
    conditionSummary: 'Impulsivity, inattention',
    medications: [
      { name: 'Medication V', dose: '5mg', time: 'Morning' },
      { name: 'Medication W', dose: '2.5mg', time: 'Afternoon' },
      { name: 'Medication X', dose: '2.5mg', time: 'Bedtime' }
    ]
  },
  {
    firstName: 'Chloe',
    lastName: 'Murphy',
    dateOfBirth: '7/5/2011',
    condition: 'Down Syndrome',
    conditionSummary: 'Intellectual disability, delayed development',
    medications: [
      { name: 'Medication Y', dose: '10mg', time: 'Morning' },
      { name: 'Medication Z', dose: '7.5mg', time: 'Evening' }
    ]
  },
  {
    firstName: 'Benjamin',
    lastName: 'Anderson',
    dateOfBirth: '2/14/2008',
    condition: 'Epilepsy',
    conditionSummary: 'Seizures, cognitive impairment',
    medications: [
      { name: 'Medication AA', dose: '20mg', time: 'Morning' },
      { name: 'Medication AB', dose: '10mg', time: 'Evening' },
      { name: 'Medication AC', dose: '5mg', time: 'Bedtime' }
    ]
  },
  {
    firstName: 'Grace',
    lastName: 'Turner',
    dateOfBirth: '9/28/2004',
    condition: 'Muscular Dystrophy',
    conditionSummary: 'Muscle weakness, mobility limitations',
    medications: [
      { name: 'Medication AD', dose: '15mg', time: 'Morning' },
      { name: 'Medication AE', dose: '10mg', time: 'Afternoon' },
      { name: 'Medication AF', dose: '2.5mg', time: 'Bedtime' },
      { name: 'Medication AG', dose: '5mg', time: 'Bedtime' }
    ]
  },
  {    firstName: 'Samuel',    lastName: 'Wright',    dateOfBirth: '3/12/2010',    condition: 'Cerebral Palsy',    conditionSummary: 'Motor impairment, speech difficulties',    medications: [      { name: 'Medication AH', dose: '10mg', time: 'Morning' },      { name: 'Medication AI', dose: '5mg', time: 'Evening' }    ]
},
{
  firstName: 'Ava',
  lastName: 'Cooper',
  dateOfBirth: '8/8/2012',
  condition: 'Autism Spectrum Disorder',
  conditionSummary: 'Difficulty with social interaction, repetitive behaviors',
  medications: [
    { name: 'Medication AJ', dose: '10mg', time: 'Morning' },
    { name: 'Medication AK', dose: '5mg', time: 'Evening' },
    { name: 'Medication AL', dose: '2.5mg', time: 'Bedtime' }
  ]
},
{
  firstName: 'Alexander',
  lastName: 'Richardson',
  dateOfBirth: '5/20/2007',
  condition: 'Intellectual Disability',
  conditionSummary: 'Developmental delay, speech difficulties',
  medications: [
    { name: 'Medication AM', dose: '15mg', time: 'Morning' },
    { name: 'Medication AN', dose: '7.5mg', time: 'Evening' },
    { name: 'Medication AO', dose: '2.5mg', time: 'Bedtime' }
  ]
},
{
  firstName: 'Amelia',
  lastName: 'Walker',
  dateOfBirth: '9/14/2005',
  condition: 'Epilepsy',
  conditionSummary: 'Seizures, cognitive impairment',
  medications: [
    { name: 'Medication AP', dose: '25mg', time: 'Morning' },
    { name: 'Medication AQ', dose: '15mg', time: 'Evening' },
    { name: 'Medication AR', dose: '10mg', time: 'Bedtime' }
  ]
},
{
  firstName: 'James',
  lastName: 'Martinez',
  dateOfBirth: '12/8/2011',
  condition: 'Cerebral Palsy',
  conditionSummary: 'Muscle spasticity, speech difficulties',
  medications: [
    { name: 'Medication AS', dose: '10mg', time: 'Morning' },
    { name: 'Medication AT', dose: '5mg', time: 'Evening' }
  ]
},
{
  firstName: 'Isabella',
  lastName: 'Turner',
  dateOfBirth: '6/25/2007',
  condition: 'Autism Spectrum Disorder',
  conditionSummary: 'Sensory sensitivities, repetitive behaviors',
  medications: [
    { name: 'Medication AU', dose: '15mg', time: 'Morning' },
    { name: 'Medication AV', dose: '10mg', time: 'Evening' },
    { name: 'Medication AW', dose: '2.5mg', time: 'Bedtime' }
  ]
},
{
  firstName: 'Benjamin',
  lastName: 'Perez',
  dateOfBirth: '3/17/2014',
  condition: 'Intellectual Disability',
  conditionSummary: 'Developmental delay, speech difficulties',
  medications: [
    { name: 'Medication AX', dose: '5mg', time: 'Morning' },
    { name: 'Medication AY', dose: '2.5mg', time: 'Afternoon' },
    { name: 'Medication AZ', dose: '2.5mg', time: 'Bedtime' }
  ]
},

{
  firstName: 'Harper',
  lastName: 'Cooper',
  dateOfBirth: '11/2/2006',
  condition: 'Down Syndrome',
  conditionSummary: 'Intellectual disability, delayed development',
  medications: [
    { name: 'Medication BA', dose: '10mg', time: 'Morning' },
    { name: 'Medication BB', dose: '7.5mg', time: 'Evening' }
  ]
},
{
  firstName: 'Benjamin',
  lastName: 'Perez',
  dateOfBirth: '3/17/2014',
  condition: 'Intellectual Disability',
  conditionSummary: 'Developmental delay, speech difficulties',
  medications: [
    { name: 'Medication AX', dose: '5mg', time: 'Morning' },
    { name: 'Medication AY', dose: '2.5mg', time: 'Afternoon' },
    { name: 'Medication AZ', dose: '2.5mg', time: 'Bedtime' }
  ]
},

{
  firstName: 'Harper',
  lastName: 'Cooper',
  dateOfBirth: '11/2/2006',
  condition: 'Down Syndrome',
  conditionSummary: 'Intellectual disability, delayed development',
  medications: [
    { name: 'Medication BA', dose: '10mg', time: 'Morning' },
    { name: 'Medication BB', dose: '7.5mg', time: 'Evening' }
  ]
},

{
  firstName: 'Olivia',
  lastName: 'Scott',
  dateOfBirth: '8/11/2010',
  condition: 'Muscular Dystrophy',
  conditionSummary: 'Muscle weakness, mobility limitations',
  medications: [
    { name: 'Medication BC', dose: '15mg', time: 'Morning' },
    { name: 'Medication BD', dose: '10mg', time: 'Afternoon' },
    { name: 'Medication BE', dose: '2.5mg', time: 'Bedtime' },
    { name: 'Medication BF', dose: '5mg', time: 'Bedtime' }
  ]
},

{
  firstName: 'Samuel',
  lastName: 'Murphy',
  dateOfBirth: '5/7/2008',
  condition: 'Cerebral Palsy',
  conditionSummary: 'Motor impairment, speech difficulties',
  medications: [
    { name: 'Medication BG', dose: '10mg', time: 'Morning' },
    { name: 'Medication BH', dose: '5mg', time: 'Evening' }
  ]
},

{
  firstName: 'Evelyn',
  lastName: 'Anderson',
  dateOfBirth: '10/25/2012',
  condition: 'Autism Spectrum Disorder',
  conditionSummary: 'Difficulty with social interaction, repetitive behaviors',
  medications: [
    { name: 'Medication BI', dose: '10mg', time: 'Morning' },
    { name: 'Medication BJ', dose: '5mg', time: 'Evening' },
    { name: 'Medication BK', dose: '2.5mg', time: 'Bedtime' }
  ]
},

{
  firstName: 'Lucas',
  lastName: 'Turner',
  dateOfBirth: '4/30/2009',
  condition: 'Attention Deficit Hyperactivity Disorder (ADHD)',
  conditionSummary: 'Impulsivity, inattention',
  medications: [
    { name: 'Medication BL', dose: '5mg', time: 'Morning' },
    { name: 'Medication BM', dose: '2.5mg', time: 'Afternoon' },
    { name: 'Medication BN', dose: '2.5mg', time: 'Bedtime' }
  ]
},

{
  "firstName": "Ava",
  "lastName": "Smith",
  "dateOfBirth": "7/22/2013",
  "diagnosis": "Epilepsy",
  "symptoms": "Seizures, cognitive impairment",
  "medications": [
  {"name": "BO", "dose": "20mg", "time": "Morning"},
  {"name": "BP", "dose": "10mg", "time": "Evening"},
  {"name": "BQ", "dose": "5mg", "time": "Bedtime"}
  ]
  },
  
  {
  "firstName": "Jackson",
  "lastName": "Adams",
  "dateOfBirth": "1/18/2010",
  "diagnosis": "Intellectual Disability",
  "symptoms": "Developmental delay, speech difficulties",
  "medications": [
  {"name": "BR", "dose": "5mg", "time": "Morning"},
  {"name": "BS", "dose": "2.5mg", "time": "Evening"},
  {"name": "BT", "dose": "2.5mg", "time": "Bedtime"}
  ]
  },
  
  {
  "firstName": "Lily",
  "lastName": "Evans",
  "dateOfBirth": "4/5/2007",
  "diagnosis": "Cerebral Palsy",
  "symptoms": "Muscle spasticity, speech difficulties",
  "medications": [
  {"name": "BU", "dose": "10mg", "time": "Morning"},
  {"name": "BV", "dose": "5mg", "time": "Evening"}
  ]
  },
  
  {
  "firstName": "Ethan",
  "lastName": "Murphy",
  "dateOfBirth": "9/12/2013",
  "diagnosis": "Autism Spectrum Disorder",
  "symptoms": "Difficulty with social interaction, repetitive behaviors",
  "medications": [
  {"name": "BW", "dose": "10mg", "time": "Morning"},
  {"name": "BX", "dose": "5mg", "time": "Evening"},
  {"name": "BY", "dose": "2.5mg", "time": "Bedtime"}
  ]
  },
  {
    firstName: "Grace",
    lastName: "Turner",
    dateOfBirth: "6/30/2006",
    diagnosis: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
      { name: "BZ", dose: "10mg", time: "Morning" },
      { name: "CA", dose: "7.5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Daniel",
    lastName: "Turner",
    dateOfBirth: "11/8/2009",
    diagnosis: "Epilepsy",
    symptoms: "Seizures, cognitive impairment",
    medications: [
      { name: "CB", dose: "20mg", time: "Morning" },
      { name: "CC", dose: "10mg", time: "Evening" },
      { name: "CD", dose: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Zoey",
    lastName: "Johnson",
    dateOfBirth: "2/14/2011",
    diagnosis: "Muscular Dystrophy",
    symptoms: "Muscle weakness, mobility limitations",
    medications: [
      { name: "CE", dose: "15mg", time: "Morning" },
      { name: "CF", dose: "10mg", time: "Afternoon" },
      { name: "CG", dose: "2.5mg", time: "Bedtime" },
      { name: "CH", dose: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Liam",
    lastName: "Martinez",
    dateOfBirth: "8/28/2008",
    diagnosis: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      { name: "CI", dose: "10mg", time: "Morning" },
      { name: "CJ", dose: "5mg", time: "Evening" }
    ]
  },
  {    "firstName": "Natalie",    "lastName": "Parker",    "dateOfBirth": "21/05/2012",    "diagnosis": "Autism Spectrum Disorder",    "symptoms": "Sensory sensitivities, repetitive behaviors",    "medications": [      {"name": "CK", "dose": "10mg", "time": "Morning"},      {"name": "CL", "dose": "5mg", "time": "Evening"},      {"name": "CM", "dose": "2.5mg", "time": "Bedtime"}    ]
},
{
  "firstName": "William",
  "lastName": "Turner",
  "dateOfBirth": "17/03/2009",
  "diagnosis": "Attention Deficit Hyperactivity Disorder (ADHD)",
  "symptoms": "Impulsivity, inattention",
  "medications": [
    {"name": "CN", "dose": "5mg", "time": "Morning"},
    {"name": "CO", "dose": "2.5mg", "time": "Afternoon"},
    {"name": "CP", "dose": "2.5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Aisha",
  "lastName": "Hassan",
  "dateOfBirth": "18/01/2010",
  "diagnosis": "Intellectual Disability",
  "symptoms": "Developmental delay, speech difficulties",
  "medications": [
    {"name": "DA", "dose": "5mg", "time": "Morning"},
    {"name": "DB", "dose": "2.5mg", "time": "Evening"},
    {"name": "DC", "dose": "2.5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Omar",
  "lastName": "Ibrahim",
  "dateOfBirth": "05/04/2007",
  "diagnosis": "Cerebral Palsy",
  "symptoms": "Muscle spasticity, speech difficulties",
  "medications": [
    {"name": "DD", "dose": "10mg", "time": "Morning"},
    {"name": "DE", "dose": "5mg", "time": "Evening"}
  ]
},
{
  "firstName": "Fatima",
  "lastName": "Ali",
  "dateOfBirth": "12/09/2013",
  "diagnosis": "Autism Spectrum Disorder",
  "symptoms": "Difficulty with social interaction, repetitive behaviors",
  "medications": [
    {"name": "DF", "dose": "10mg", "time": "Morning"},
    {"name": "DG", "dose": "5mg", "time": "Evening"},
    {"name": "DH", "dose": "2.5mg", "time": "Bedtime"}
  ]
},

{
  "firstName": "Ali",
  "lastName": "Khalil",
  "dateOfBirth": "30/06/2006",
  "diagnosis": "Down Syndrome",
  "symptoms": "Intellectual disability, delayed development",
  "medications": [
    {"name": "DI", "dose": "10mg", "time": "Morning"},
    {"name": "DJ", "dose": "7.5mg", "time": "Evening"}
  ]
},

{
  "firstName": "Mariam",
  "lastName": "Abdulrahman",
  "dateOfBirth": "08/11/2009",
  "diagnosis": "Epilepsy",
  "symptoms": "Seizures, cognitive impairment",
  "medications": [
    {"name": "DK", "dose": "20mg", "time": "Morning"},
    {"name": "DL", "dose": "10mg", "time": "Evening"},
    {"name": "DM", "dose": "5mg", "time": "Bedtime"}
  ]
},

{
  "firstName": "Ahmed",
  "lastName": "Saleh",
  "dateOfBirth": "14/02/2011",
  "diagnosis": "Muscular Dystrophy",
  "symptoms": "Muscle weakness, mobility limitations",
  "medications": [
    {"name": "DN", "dose": "15mg", "time": "Morning"},
    {"name": "DO", "dose": "10mg", "time": "Afternoon"},
    {"name": "DP", "dose": "2.5mg", "time": "Bedtime"},
    {"name": "DQ", "dose": "5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Nour",
  "lastName": "Mahmoud",
  "dateOfBirth": "8/28/2008",
  "diagnosis": "Cerebral Palsy",
  "symptoms": "Motor impairment, speech difficulties",
  "medications": [
    {"name": "DR", "dose": "10mg", "time": "Morning"},
    {"name": "DS", "dose": "5mg", "time": "Evening"}
  ]
},
{
  "firstName": "Yara",
  "lastName": "Khalid",
  "dateOfBirth": "21/05/2012",
  "diagnosis": "Autism Spectrum Disorder",
  "symptoms": "Sensory sensitivities, repetitive behaviors",
  "medications": [
    {"name": "DT", "dose": "10mg", "time": "Morning"},
    {"name": "DU", "dose": "5mg", "time": "Evening"},
    {"name": "DV", "dose": "2.5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Hamza",
  "lastName": "Hassan",
  "dateOfBirth": "17/03/2009",
  "diagnosis": "Attention Deficit Hyperactivity Disorder (ADHD)",
  "symptoms": "Impulsivity, inattention",
  "medications": [
    {"name": "DW", "dose": "5mg", "time": "Morning"},
    {"name": "DX", "dose": "2.5mg", "time": "Afternoon"},
    {"name": "DY", "dose": "2.5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Leila",
  "lastName": "Ahmed",
  "dateOfBirth": "12/06/2014",
  "diagnosis": "Epilepsy",
  "symptoms": "Seizures, cognitive impairment",
  "medications": [
    {"name": "DZ", "dose": "20mg", "time": "Morning"},
    {"name": "EA", "dose": "10mg", "time": "Evening"},
    {"name": "EB", "dose": "5mg", "time": "Bedtime"}
  ]
},
{
  "firstName": "Aya",
  "lastName": "Mohammed",
  "dateOfBirth": "09/07/2015",
  "diagnosis": "Down Syndrome",
  "symptoms": "Intellectual disability, delayed development",
  "medications": [
    "Medication EC (5mg) - Morning",
    "Medication ED (2.5mg) - Evening"
  ]
},
{
  "firstName": "Omar",
  "lastName": "Ahmed",
  "dateOfBirth": "20/09/2014",
  "diagnosis": "Cerebral Palsy",
  "symptoms": "Motor impairment, speech difficulties",
  "medications": [
    "Medication EE (10mg) - Morning",
    "Medication EF (5mg) - Evening"
  ]
},
{
  "firstName": "Nada",
  "lastName": "Abdullah",
  "dateOfBirth": "08/03/2017",
  "diagnosis": "Autism Spectrum Disorder",
  "symptoms": "Difficulty with social interaction, repetitive behaviors",
  "medications": [
    "Medication EG (7.5mg) - Morning",
    "Medication EH (2.5mg) - Evening",
    "Medication EI (2.5mg) - Bedtime"
  ]
},
{
  "firstName": "Zaid",
  "lastName": "Al-Abbas",
  "dateOfBirth": "14/11/2013",
  "diagnosis": "Muscular Dystrophy",
  "symptoms": "Muscle weakness, mobility limitations",
  "medications": [
    "Medication EJ (15mg) - Morning",
    "Medication EK (10mg) - Afternoon",
    "Medication EL (5mg) - Bedtime"
  ]
},
{
  "firstName": "Lina",
  "lastName": "Ibrahim",
  "dateOfBirth": "03/06/2016",
  "diagnosis": "Epilepsy",
  "symptoms": "Seizures, cognitive impairment",
  "medications": [
  "Medication EM (20mg) - Morning",
  "Medication EN (10mg) - Evening",
  "Medication EO (5mg) - Bedtime"
  ]
  },
  {
  "firstName": "Adam",
  "lastName": "Hussein",
  "dateOfBirth": "28/08/2014",
  "diagnosis": "Cerebral Palsy",
  "symptoms": "Motor impairment, speech difficulties",
  "medications": [
  "Medication EP (10mg) - Morning",
  "Medication EQ (5mg) - Evening"
  ]
  },
  {
  "firstName": "Hana",
  "lastName": "Al-Ali",
  "dateOfBirth": "01/12/2013",
  "diagnosis": "Intellectual Disability",
  "symptoms": "Developmental delay, speech difficulties",
  "medications": [
  "Medication ER (5mg) - Morning",
  "Medication ES (2.5mg) - Evening",
  "Medication ET (2.5mg) - Bedtime"
  ]
  },
  {
  "firstName": "Youssef",
  "lastName": "Salah",
  "dateOfBirth": "11/04/2015",
  "diagnosis": "Autism Spectrum Disorder",
  "symptoms": "Sensory sensitivities, repetitive behaviors",
  "medications": [
  "Medication EU (10mg) - Morning",
  "Medication EV (5mg) - Evening",
  "Medication EW (2.5mg) - Bedtime"
  ]
  },
  {    firstName: "Layan",    lastName: "Abdulrahman",    dateOfBirth: "18/02/2017",    diagnosis: "Down Syndrome",    symptoms: "Intellectual disability, delayed development",    medications: [      "Medication EX (5mg) - Morning",      "Medication EY (2.5mg) - Evening"    ]
  },
  {
    firstName: "Kareem",
    lastName: "Hamdan",
    dateOfBirth: "25/11/2016",
    diagnosis: "Attention Deficit Hyperactivity Disorder (ADHD)",
    symptoms: "Impulsivity, inattention",
    medications: [
      "Medication EZ (5mg) - Morning",
      "Medication FA (2.5mg) - Afternoon",
      "Medication FB (2.5mg) - Bedtime"
    ]
  },
  {
    firstName: "Reem",
    lastName: "Hassan",
    dateOfBirth: "07/07/2014",
    diagnosis: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      "Medication FC (10mg) - Morning",
      "Medication FD (5mg) - Evening"
    ]
  },
  {
    firstName: "Mohammed",
    lastName: "Khalil",
    dateOfBirth: "12/09/2015",
    diagnosis: "Autism Spectrum Disorder",
    symptoms: "Difficulty with social interaction, repetitive behaviors",
    medications: [
      "Medication FE (7.5mg) - Morning",
      "Medication FF (2.5mg) - Evening",
      "Medication FG (2.5mg) - Bedtime"
    ]
  },
  {    firstName: "Amira",    lastName: "Ali",    dateOfBirth: "25/06/2013",    condition: "Intellectual Disability",    symptoms: "Developmental delay, speech difficulties",    medications: [      { name: "FH", dosage: "5mg", time: "Morning" },      { name: "FI", dosage: "2.5mg", time: "Evening" },      { name: "FJ", dosage: "2.5mg", time: "Bedtime" }    ]
  },
  {
    firstName: "Ahmed",
    lastName: "Mohammed",
    dateOfBirth: "09/04/2016",
    condition: "Muscular Dystrophy",
    symptoms: "Muscle weakness, mobility limitations",
    medications: [
      { name: "FK", dosage: "15mg", time: "Morning" },
      { name: "FL", dosage: "10mg", time: "Afternoon" },
      { name: "FM", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Noor",
    lastName: "Abbas",
    dateOfBirth: "14/08/2017",
    condition: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
      { name: "FN", dosage: "5mg", time: "Morning" },
      { name: "FO", dosage: "2.5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Hala",
    lastName: "Saleh",
    dateOfBirth: "07/12/2015",
    condition: "Epilepsy",
    symptoms: "Seizures, cognitive impairment",
    medications: [
      { name: "FP", dosage: "20mg", time: "Morning" },
      { name: "FQ", dosage: "10mg", time: "Evening" },
      { name: "FR", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Hasan",
    lastName: "Ahmed",
    dateOfBirth: "20/11/2014",
    condition: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      { name: "FS", dosage: "10mg", time: "Morning" },
      { name: "FT", dosage: "5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Rana",
    lastName: "Al-Khaldi",
    dateOfBirth: "01/10/2013",
    diagnosis: "Autism Spectrum Disorder",
    symptoms: "Sensory sensitivities, repetitive behaviors",
    medications: [
      { name: "FU", dose: "10mg", time: "Morning" },
      { name: "FV", dose: "5mg", time: "Evening" },
      { name: "FW", dose: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Khalid",
    lastName: "Hasan",
    dateOfBirth: "18/02/2016",
    condition: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
      { name: "FX", dose: "5mg", time: "Morning" },
      { name: "FY", dose: "2.5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Yasmin",
    lastName: "Al-Abdul",
    dateOfBirth: "15/01/2017",
    condition: "Attention Deficit Hyperactivity Disorder (ADHD)",
    symptoms: "Impulsivity, inattention",
    medications: [
      { name: "FZ", dose: "5mg", time: "Morning" },
      { name: "GA", dose: "2.5mg", time: "Afternoon" },
      { name: "GB", dose: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Ali",
    lastName: "Al-Khalifa",
    dateOfBirth: "05/08/2015",
    condition: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
      { name: "FC", dose: "5mg", time: "Morning" },
      { name: "FD", dose: "2.5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Fatima",
    lastName: "Al-Farouqi",
    dateOfBirth: "12/10/2014",
    condition: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      { name: "FE", dose: "10mg", time: "Morning" },
      { name: "FF", dose: "5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Ahmad",
    lastName: "Al-Qasimi",
    dateOfBirth: "03/04/2016",
    diagnosis: "Intellectual Disability",
    symptoms: ["Developmental delay", "speech difficulties"],
    medications: [
      { name: "FG", dosage: "5mg", time: "Morning" },
      { name: "FH", dosage: "2.5mg", time: "Evening" },
      { name: "FI", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Hadi",
    lastName: "Al-Mansouri",
    dateOfBirth: "21/09/2013",
    diagnosis: "Muscular Dystrophy",
    symptoms: ["Muscle weakness", "mobility limitations"],
    medications: [
      { name: "FJ", dosage: "15mg", time: "Morning" },
      { name: "FK", dosage: "10mg", time: "Afternoon" },
      { name: "FL", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Layla",
    lastName: "Al-Sayed",
    dateOfBirth: "16/05/2017",
    diagnosis: "Autism Spectrum Disorder",
    symptoms: ["Difficulty with social interaction"],
    medications: [
      { name: "FM", dosage: "7.5mg", time: "Morning" },
      { name: "FN", dosage: "2.5mg", time: "Evening" },
      { name: "FO", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Hamza",
    lastName: "Al-Qahtani",
    dateOfBirth: "30/11/2014",
    diagnosis: "Attention Deficit Hyperactivity Disorder (ADHD)",
    symptoms: ["Impulsivity", "inattention"],
    medications: [
      { name: "FP", dosage: "5mg", time: "Morning" },
      { name: "FQ", dosage: "2.5mg", time: "Afternoon" },
      { name: "FR", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Nadia",
    lastName: "Al-Mazroui",
    dateOfBirth: "09/02/2015",
    diagnosis: "Epilepsy",
    symptoms: ["Seizures", "cognitive impairment"],
    medications: [
      { name: "FS", dosage: "20mg", time: "Morning" },
      { name: "FT", dosage: "10mg", time: "Evening" },
      { name: "FU", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {    firstName: "Sultan",    lastName: "Al-Saadi",    dateOfBirth: "28/08/2016",    condition: "Down Syndrome",    symptoms: "Intellectual disability, delayed development",    medications: [      { name: "FV", dosage: "5mg", time: "Morning" },      { name: "FW", dosage: "2.5mg", time: "Evening" }    ]
},
{
  firstName: "Sara",
  lastName: "Al-Masri",
  dateOfBirth: "17/10/2013",
  condition: "Cerebral Palsy",
  symptoms: "Motor impairment, speech difficulties",
  medications: [
    { name: "FX", dosage: "10mg", time: "Morning" },
    { name: "FY", dosage: "5mg", time: "Evening" }
  ]
},
{
  firstName: "Khalil",
  lastName: "Al-Rashid",
  dateOfBirth: "23/01/2017",
  condition: "Autism Spectrum Disorder",
  symptoms: "Difficulty with social interaction, repetitive behaviors",
  medications: [
    { name: "FZ", dosage: "7.5mg", time: "Morning" },
    { name: "GA", dosage: "2.5mg", time: "Evening" },
    { name: "GB", dosage: "2.5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Aisha",
  lastName: "Hassan",
  dateOfBirth: "07/09/2015",
  condition: "Spina Bifida",
  symptoms: "Mobility limitations, neurogenic bladder",
  medications: [
    { name: "FC", dosage: "5mg", time: "Morning" },
    { name: "FD", dosage: "2.5mg", time: "Evening" },
    { name: "FE", dosage: "2.5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Mustafa",
  lastName: "Khalil",
  dateOfBirth: "16/07/2014",
  condition: "Intellectual Disability",
  symptoms: "Developmental delay, speech difficulties",
  medications: [
    { name: "FF", dosage: "5mg", time: "Morning" },
    { name: "FG", dosage: "2.5mg", time: "Evening" }
  ]
},
{
  firstName: "Fatima",
  lastName: "Mansour",
  dateOfBirth: "24/03/2016",
  condition: "Cerebral Palsy",
  symptoms: "Motor impairment, speech difficulties",
  medications: [
    { name: "FH", dosage: "10mg", time: "Morning" },
    { name: "FI", dosage: "5mg", time: "Evening" }
  ]
},
{
  firstName: "Ahmed",
  lastName: "Saad",
  dateOfBirth: "12/10/2013",
  condition: "Down Syndrome",
  symptoms: "Intellectual disability, delayed development",
  medications: [
    { name: "FJ", dosage: "5mg", time: "Morning" },
    { name: "FK", dosage: "2.5mg", time: "Evening" },
    { name: "FL", dosage: "2.5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Nour",
  lastName: "Ali",
  dateOfBirth: "08/06/2015",
  condition: "Autism Spectrum Disorder",
  symptoms: "Difficulty with social interaction, repetitive behaviors",
  medications: [
    { name: "FM", dosage: "7.5mg", time: "Morning" },
    { name: "FN", dosage: "2.5mg", time: "Evening" },
    { name: "FO", dosage: "2.5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Khalid",
  lastName: "Abbas",
  dateOfBirth: "30/09/2014",
  condition: "Muscular Dystrophy",
  symptoms: "Muscle weakness, mobility limitations",
  medications: [
    { name: "FP", dosage: "15mg", time: "Morning" },
    { name: "FQ", dosage: "10mg", time: "Afternoon" },
    { name: "FR", dosage: "5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Salma",
  lastName: "Omar",
  dateOfBirth: "05/04/2017",
  condition: "Epilepsy",
  symptoms: "Seizures, cognitive impairment",
  medications: [
    { name: "FS", dosage: "20mg", time: "Morning" },
    { name: "FT", dosage: "10mg", time: "Evening" },
    { name: "FU", dosage: "5mg", time: "Bedtime" }
  ]
},
{
  firstName: "Ali",
  lastName: "Ibrahim",
  dateOfBirth: "22/08/2016",
  condition: "Cerebral Palsy",
  symptoms: "Motor impairment, speech difficulties",
  medications: [
    { name: "FV", dosage: "10mg", time: "Morning" },
    { name: "FW", dosage: "5mg", time: "Evening" }
  ]
},
{
  firstName: "Amina",
  lastName: "Hussein",
  dateOfBirth: "19/11/2014",
  condition: "Intellectual Disability",
  symptoms: "Developmental delay, speech difficulties",
  medications: [
  { name: "FX", dosage: "5mg", time: "Morning" },
  { name: "FY", dosage: "2.5mg", time: "Evening" },
  { name: "FZ", dosage: "2.5mg", time: "Bedtime" }
  ]
  },
  {
  firstName: "Ryan",
  lastName: "Salah",
  dateOfBirth: "14/05/2015",
  condition: "Autism Spectrum Disorder",
  symptoms: "Sensory sensitivities, repetitive behaviors",
  medications: [
  { name: "GA", dosage: "10mg", time: "Morning" },
  { name: "GB", dosage: "5mg", time: "Evening" },
  { name: "GC", dosage: "2.5mg", time: "Bedtime" }
  ]
  },
  {
  firstName: "Yara",
  lastName: "Hassan",
  dateOfBirth: "18/02/2014",
  condition: "Spina Bifida",
  symptoms: "Mobility limitations, neurogenic bladder",
  medications: [
  { name: "GD", dosage: "5mg", time: "Morning" },
  { name: "GE", dosage: "2.5mg", time: "Evening" }
  ]
  },
  {
  firstName: "Omar",
  lastName: "Abdullah",
  dateOfBirth: "10/07/2015",
  condition: "Intellectual Disability",
  symptoms: "Developmental delay, speech difficulties",
  medications: [
  { name: "GF", dosage: "10mg", time: "Morning" },
  { name: "GG", dosage: "5mg", time: "Evening" },
  { name: "GH", dosage: "2.5mg", time: "Bedtime" }
  ]
  },
  {
  firstName: "Layla",
  lastName: "Mahmoud",
  dateOfBirth: "28/09/2016",
  condition: "Cerebral Palsy",
  symptoms: "Motor impairment, speech difficulties",
  medications: [
  { name: "GI", dosage: "7.5mg", time: "Morning" },
  { name: "GJ", dosage: "5mg", time: "Evening" }
  ]
  },
  {
  firstName: "Zaid",
  lastName: "Ibrahim",
  dateOfBirth: "25/06/2014",
  condition: "Down Syndrome",
  symptoms: "Intellectual disability, delayed development",
  medications: [
  { name: "GK", dosage: "5mg", time: "Morning" },
  { name: "GL", dosage: "2.5mg", time: "Evening" },
  { name: "GM", dosage: "2.5mg", time: "Bedtime" }
  ]
  },
  {
    firstName: "Nada",
    lastName: "Ali",
    dateOfBirth: "12/11/2015",
    condition: "Autism Spectrum Disorder",
    symptoms: "Difficulty with social interaction, repetitive behaviors",
    medications: [
      { name: "GN", dosage: "7.5mg", time: "Morning" },
      { name: "GO", dosage: "2.5mg", time: "Evening" },
      { name: "GP", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Hasan",
    lastName: "Mahmoud",
    dateOfBirth: "04/02/2016",
    condition: "Muscular Dystrophy",
    symptoms: "Muscle weakness, mobility limitations",
    medications: [
      { name: "GQ", dosage: "15mg", time: "Morning" },
      { name: "GR", dosage: "10mg", time: "Afternoon" },
      { name: "GS", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Amira",
    lastName: "Hassan",
    dateOfBirth: "20/06/2017",
    condition: "Epilepsy",
    symptoms: "Seizures, cognitive impairment",
    medications: [
      { name: "GT", dosage: "20mg", time: "Morning" },
      { name: "GU", dosage: "10mg", time: "Evening" },
      { name: "GV", dosage: "5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Kareem",
    lastName: "Salah",
    dateOfBirth: "15/09/2015",
    condition: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      { name: "GW", dosage: "10mg", time: "Morning" },
      { name: "GX", dosage: "5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Rahma",
    lastName: "Khalil",
    dateOfBirth: "07/11/2016",
    condition: "Intellectual Disability",
    symptoms: "Developmental delay, speech difficulties",
    medications: [
      { name: "GY", dosage: "5mg", time: "Morning" },
      { name: "GZ", dosage: "2.5mg", time: "Evening" },
      { name: "HA", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Tariq",
    lastName: "Hussein",
    dateOfBirth: "03/08/2014",
    condition: "Autism Spectrum Disorder",
    symptoms: "Sensory sensitivities, repetitive behaviors",
    medications: [
      { name: "HB", dosage: "10mg", time: "Morning" },
      { name: "HC", dosage: "5mg", time: "Evening" },
      { name: "HD", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Amal",
    lastName: "Omar",
    dateOfBirth: "11/03/2015",
    condition: "Spina Bifida",
    symptoms: "Mobility limitations, neurogenic bladder",
    medications: [
    { name: "HE", dosage: "5mg", time: "Morning" },
    { name: "HF", dosage: "2.5mg", time: "Evening" }
    ]
    },
    {
    firstName: "Abdul",
    lastName: "Ahmed",
    dateOfBirth: "07/05/2016",
    condition: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
    { name: "HG", dosage: "5mg", time: "Morning" },
    { name: "HH", dosage: "2.5mg", time: "Evening" },
    { name: "HI", dosage: "2.5mg", time: "Bedtime" }
    ]
    },
    {
    firstName: "Hana",
    lastName: "Mustafa",
    dateOfBirth: "02/09/2017",
    condition: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
    { name: "HJ", dosage: "7.5mg", time: "Morning" },
    { name: "HK", dosage: "5mg", time: "Evening" }
    ]
    },
    {
    firstName: "Salah",
    lastName: "Ibrahim",
    dateOfBirth: "29/12/2014",
    condition: "Autism Spectrum Disorder",
    symptoms: "Difficulty with social interaction, repetitive behaviors",
    medications: [
    { name: "HL", dosage: "7.5mg", time: "Morning" },
    { name: "HM", dosage: "5mg", time: "Evening" },
    { name: "HN", dosage: "2.5mg", time: "Bedtime" }
    ]
    },
    {
    firstName: "Aisha",
    lastName: "Hassan",
    dateOfBirth: "16/08/2015",
    condition: "Intellectual Disability",
    symptoms: "Developmental delay, speech difficulties",
    medications: [
    { name: "HO", dosage: "5mg", time: "Morning" },
    { name: "HP", dosage: "2.5mg", time: "Evening" },
    { name: "HQ", dosage: "2.5mg", time: "Bedtime" }
    ]
    },
    {
    firstName: "Mahmoud",
    lastName: "Ali",
    dateOfBirth: "08/10/2016",
    condition: "Muscular Dystrophy",
    symptoms: "Muscle weakness, mobility limitations",
    medications: [
    { name: "HR", dosage: "15mg", time: "Morning" },
    { name: "HS", dosage: "10mg", time: "Afternoon" },
    { name: "HT", dosage: "5mg", time: "Bedtime" }
    ]
    },
    {    firstName: "Sara",    lastName: "Omar",    dateOfBirth: "25/04/2017",    condition: "Epilepsy",    symptoms: "Seizures, cognitive impairment",    medications: [      { name: "HU", dosage: "20mg", time: "Morning" },      { name: "HV", dosage: "10mg", time: "Evening" },      { name: "HW", dosage: "5mg", time: "Bedtime" }    ]
  },
  {
    firstName: "Ahmed",
    lastName: "Salah",
    dateOfBirth: "21/07/2014",
    condition: "Cerebral Palsy",
    symptoms: "Motor impairment, speech difficulties",
    medications: [
      { name: "HX", dosage: "10mg", time: "Morning" },
      { name: "HY", dosage: "5mg", time: "Evening" }
    ]
  },
  {
    firstName: "Fatima",
    lastName: "Khalil",
    dateOfBirth: "13/10/2015",
    condition: "Down Syndrome",
    symptoms: "Intellectual disability, delayed development",
    medications: [
      { name: "HZ", dosage: "5mg", time: "Morning" },
      { name: "IA", dosage: "2.5mg", time: "Evening" },
      { name: "IB", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    firstName: "Hassan",
    lastName: "Hussein",
    dateOfBirth: "05/12/2016",
    condition: "Autism Spectrum Disorder",
    symptoms: "Sensory sensitivities, repetitive behaviors",
    medications: [
      { name: "IC", dosage: "10mg", time: "Morning" },
      { name: "ID", dosage: "5mg", time: "Evening" },
      { name: "IE", dosage: "2.5mg", time: "Bedtime" }
    ]
  },
  {
    name: "Mariam",
    surname: "Omar",
    dateOfBirth: "01/09/2014",
    diagnosis: "Spina Bifida",
    symptoms: ["Mobility limitations", "neurogenic bladder"],
    medications: [
      { name: "IF", dose: "5mg", time: "Morning" },
      { name: "IG", dose: "2.5mg", time: "Evening" },
    ],
  },
  {
    name: "Nour",
    surname: "Ahmed",
    dateOfBirth: "09/04/2015",
    diagnosis: "Intellectual Disability",
    symptoms: ["Developmental delay", "speech difficulties"],
    medications: [
      { name: "IH", dose: "5mg", time: "Morning" },
      { name: "II", dose: "2.5mg", time: "Evening" },
      { name: "IJ", dose: "2.5mg", time: "Bedtime" },
    ],
  },
  {
    name: "Ali",
    surname: "Mustafa",
    dateOfBirth: "04/06/2016",
    diagnosis: "Muscular Dystrophy",
    symptoms: ["Muscle weakness", "mobility limitations"],
    medications: [
      { name: "IK", dose: "15mg", time: "Morning" },
      { name: "IL", dose: "10mg", time: "Afternoon" },
      { name: "IM", dose: "5mg", time: "Bedtime" },
    ],
  },
  {
    name: "Yasmin",
    surname: "Ibrahim",
    dateOfBirth: "22/09/2017",
    diagnosis: "Epilepsy",
    symptoms: ["Seizures", "cognitive impairment"],
    medications: [
      { name: "IN", dose: "20mg", time: "Morning" },
      { name: "IO", dose: "10mg", time: "Evening" },
      { name: "IP", dose: "5mg", time: "Bedtime" },
    ],
  },



]