// Contact information interface
export interface Contact {
    address: string;
    email: string;
    phone: string;
}

// Organization interface
export interface Organization {
    name: string;
    contact: Contact;
    role: string;
    jointController: Array<{ name: string; contact: string }>;
    representative: string;
    dpo: string;
}

// Processor interface
export interface Processor {
    name: string;
    contact: string;
    activities: string;
}

// Legal basis interface
export interface LegalBasis {
    DSGVOArt6Abs1a: boolean;
    DSGVOArt6Abs1b: boolean;
    DSGVOArt6Abs1c: boolean;
    DSGVOArt6Abs1f: boolean;
    IfSG28b: boolean;
    "SARS-CoV-Arbeitsschutzverordnung": boolean;
    BDSG26: boolean;
    HGB257: boolean;
    HGB239Abs1: boolean;
    AO147: boolean;
}

// Data sources interface
export interface DataSources {
    microsoftOffice365: boolean;
    emailProvider: boolean;
    microsoftAzure: boolean;
    googleWorkspace: boolean;
    googleCloud: boolean;
    videoConferencing: boolean;
    amazonAWS: boolean;
    ecommercePlatform: boolean;
    libreOffice: boolean;
    onlineBanking: boolean;
    financialServices: boolean;
    webAndIntranet: boolean;
    creditServices: boolean;
    hrSoftware: boolean;
    enterpriseSystems: boolean;
    securityAndCompliance: boolean;
    documentProcessing: boolean;
    otherSpecializedSoftware: boolean;
}

// Personal data categories
export interface PersonalData {
    lastName: boolean;
    firstName: boolean;
    dateOfBirth: boolean;
    placeOfBirth: boolean;
    gender: boolean;
    nationality: boolean;
    address: boolean;
    phoneNumber: boolean;
    emailAddress: boolean;
    maritalStatus: boolean;
    religiousAffiliation: boolean;
}

export interface Employment {
    workingHours: boolean;
    professionalPosition: boolean;
    personnelNumber: boolean;
    companyAffiliation: boolean;
    vacationEntitlement: boolean;
    vacationDays: boolean;
    vacationTimes: boolean;
}

export interface Finance {
    salaryWage: boolean;
    bankDetails: boolean;
    taxIdentificationNumber: boolean;
    taxClass: boolean;
    monthlySalaries: boolean;
    monthlyWages: boolean;
    revenue: boolean;
    invoiceInformation: boolean;
}

export interface Health {
    healthInsuranceNumber: boolean;
    socialSecurityNumber: boolean;
    sickDays: boolean;
    healthData: boolean;
    insuranceStatus: boolean;
    expiryDateVaccinationRecoveryStatus: boolean;
    copyProofCertificate: boolean;
}

export interface Legal {
    contractData: boolean;
    identityDocuments: boolean;
    insolvencyDecree: boolean;
    schufaInformation: boolean;
    subscriptionData: boolean;
}

export interface Behavior {
    usageBehavior: boolean;
    behavioralData: boolean;
    browserHistory: boolean;
    metadata: boolean;
}

export interface DocumentationAndRecords {
    individualDocumentation: boolean;
    complaintData: boolean;
    receipts: boolean;
    imageMaterial: boolean;
    billingData: boolean;
    offer: boolean;
    orderData: boolean;
    deliveryAddress: boolean;
    incomingInvoice: boolean;
    outgoingInvoice: boolean;
}

export interface Vehicle {
    licensePlate: boolean;
    drivingData: boolean;
    driversLicense: boolean;
}

export interface Other {
    expertise: boolean;
    skills: boolean;
    examinationDate: boolean;
    proofStatus: boolean;
    queryDateTime: boolean;
    deliveryConditions: boolean;
    username: boolean;
    dataVolume: boolean;
}

// Data categories interface
export interface DataCategories {
    personalData: PersonalData;
    employment: Employment;
    finance: Finance;
    health: Health;
    legal: Legal;
    behavior: Behavior;
    documentationAndRecords: DocumentationAndRecords;
    vehicle: Vehicle;
    other: Other;
}

// Person categories interface
export interface AffectedPersons {
    internalGroups: boolean;
    externalCustomers: boolean;
    legalEntities: boolean;
    healthcareInstitutions: boolean;
    recruitmentAgencies: boolean;
}

export interface InternalRecipientCategories {
    management: boolean;
    administration: boolean;
    technical: boolean;
    finance: boolean;
    legalAndCompliance: boolean;
    marketingAndSales: boolean;
    logisticsAndOperations: boolean;
}

export interface ExternalRecipientCategoriesEU {
    governmentAuthorities: boolean;
    softwareAndCloudProviders: boolean;
    healthAndInsuranceProviders: boolean;
    financialInstitutions: boolean;
    businessPartnersAndAgencies: boolean;
    serviceProviders: boolean;
    others: boolean;
}

export interface ExternalRecipientCategoriesThirdCountry {
    serviceProviders: boolean;
    dataProcessors: boolean;
}

export interface AuthorizedPersons {
    managementRoles: boolean;
    administrativeRoles: boolean;
    technicalRoles: boolean;
    financialRoles: boolean;
    legalAndComplianceRoles: boolean;
    marketingAndSalesRoles: boolean;
    healthRoles: boolean;
    hrAndRecruitmentRoles: boolean;
    otherRoles: boolean;
}

// Person categories container
export interface PersonCategories {
    affectedPersons: AffectedPersons;
    internalRecipientCategories: InternalRecipientCategories;
    externalRecipientCategoriesEU: ExternalRecipientCategoriesEU;
    externalRecipientCategoriesThirdCountry: ExternalRecipientCategoriesThirdCountry;
    authorizedPersons: AuthorizedPersons;
}

// Retention periods interface
export interface RetentionPeriods {
    afterTerminationOfEmployment: boolean;
    afterContractTermination: boolean;
    uponRevocation: boolean;
    deletionTime: string;
    exceptForBeyondRetentionObligations: boolean;
    specialDeletionConcept: boolean;
}

// Main categories interface
export interface Categories {
    dataSources: DataSources;
    dataCategories: DataCategories;
    persons: PersonCategories;
}

// Main document data interface
export interface DocumentData {
    id: string;
    title: string;
    organization: Organization;
    processors: Processor[];
    technicalOrganizationalMeasures: string;
    purposeOfDataProcessing: string;
    legalBasis: LegalBasis;
    categories: Categories;
    retentionPeriods: RetentionPeriods;
    additionalInfo: string;
    language?: string;
}

// Template interface - same as DocumentData
export interface Template extends DocumentData {}

