"use client";

import {ChangeEvent, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {callLLMapi} from "@/actions/actions";
import { Loader2 } from "lucide-react"
import RopaTemplateSelector from "./ropa-template-selector";
import {useTranslations} from "next-intl";
import { availableModels, defaultModel } from "@/config/models";
import { DocumentData } from "@/models/DocumentData";
import { Sparkles } from "lucide-react";

export default function RopaForm({setGeneratedDocument}: {setGeneratedDocument: (doc: string) => void}) {

    // TODO: handle external and third country better
    const t = useTranslations('Generate');

    const [documentData, setDocumentData] = useState<DocumentData>({
        id: "",
        title: "",
        organization: {
            name: "",
            contact: {
                address: "",
                email: "",
                phone: ""
            },
            role: "",
            jointController: [],
            representative: "",
            dpo: ""
        },
        processors: [],
        //thirdCountryTransfers: [
            //{
                //"country":              "",
                //"transferMechanism":"",
                //"safeguards":""
            //}
        //],
        technicalOrganizationalMeasures: "",
        purposeOfDataProcessing: "",
        legalBasis: {
            DSGVOArt6Abs1a: false,
            DSGVOArt6Abs1b: false,
            DSGVOArt6Abs1c: false,
            DSGVOArt6Abs1f: false,
            IfSG28b: false,
            SARSCoV: false,
            BDSG26: false,
            HGB257: false,
            HGB239Abs1: false,
            AO147: false,
            other: ""
        },
        categories: {
            dataSources: {
                microsoftOffice365: false,
                emailProvider: false,
                microsoftAzure: false,
                googleWorkspace: false,
                googleCloud: false,
                videoConferencing: false,
                amazonAWS: false,
                ecommercePlatform: false,
                libreOffice: false,
                onlineBanking: false,
                financialServices: false,
                webAndIntranet: false,
                creditServices: false,
                hrSoftware: false,
                enterpriseSystems: false,
                securityAndCompliance: false,
                documentProcessing: false,
                otherSpecializedSoftware: false,
                other: ""
            },
            dataCategories: {
                personalData: {
                    lastName: false,
                    firstName: false,
                    dateOfBirth: false,
                    placeOfBirth: false,
                    gender: false,
                    nationality: false,
                    address: false,
                    phoneNumber: false,
                    emailAddress: false,
                    maritalStatus: false,
                    religiousAffiliation: false
                },
                employment: {
                    workingHours: false,
                    professionalPosition: false,
                    personnelNumber: false,
                    companyAffiliation: false,
                    vacationEntitlement: false,
                    vacationDays: false,
                    vacationTimes: false
                },
                finance: {
                    salaryWage: false,
                    bankDetails: false,
                    taxIdentificationNumber: false,
                    taxClass: false,
                    monthlySalaries: false,
                    monthlyWages: false,
                    revenue: false,
                    invoiceInformation: false
                },
                health: {
                    healthInsuranceNumber: false,
                    socialSecurityNumber: false,
                    sickDays: false,
                    healthData: false,
                    insuranceStatus: false,
                    expiryDateVaccinationRecoveryStatus: false,
                    copyProofCertificate: false
                },
                legal: {
                    contractData: false,
                    identityDocuments: false,
                    insolvencyDecree: false,
                    schufaInformation: false,
                    subscriptionData: false
                },
                behavior: {
                    usageBehavior: false,
                    behavioralData: false,
                    browserHistory: false,
                    metadata: false
                },
                documentationAndRecords: {
                    individualDocumentation: false,
                    complaintData: false,
                    receipts: false,
                    imageMaterial: false,
                    billingData: false,
                    offer: false,
                    orderData: false,
                    deliveryAddress: false,
                    incomingInvoice: false,
                    outgoingInvoice: false
                },
                vehicle: {
                    licensePlate: false,
                    drivingData: false,
                    driversLicense: false
                },
                other: {
                    expertise: false,
                    skills: false,
                    examinationDate: false,
                    proofStatus: false,
                    queryDateTime: false,
                    deliveryConditions: false,
                    username: false,
                    dataVolume: false,
                    other: ""
                }
            },
            persons: {
                affectedPersons: {
                    internalGroups: false,
                    externalCustomers: false,
                    legalEntities: false,
                    healthcareInstitutions: false,
                    recruitmentAgencies: false
                },
                internalRecipientCategories: {
                    management: false,
                    administration: false,
                    technical: false,
                    finance: false,
                    legalAndCompliance: false,
                    marketingAndSales: false,
                    logisticsAndOperations: false
                },
                externalRecipientCategoriesEU: {
                    governmentAuthorities: false,
                    softwareAndCloudProviders: false,
                    healthAndInsuranceProviders: false,
                    financialInstitutions: false,
                    businessPartnersAndAgencies: false,
                    serviceProviders: false,
                    others: false
                },
                //externalRecipientCategoriesThirdCountry: {
                //    serviceProviders: false,
                //    dataProcessors: false
                //},
                authorizedPersons: {
                    managementRoles: false,
                    administrativeRoles: false,
                    technicalRoles: false,
                    financialRoles: false,
                    legalAndComplianceRoles: false,
                    marketingAndSalesRoles: false,
                    healthRoles: false,
                    hrAndRecruitmentRoles: false,
                    otherRoles: false
                },
                other: ""
            }
        },
        retentionPeriods: {
            afterTerminationOfEmployment: false,
            afterContractTermination: false,
            uponRevocation: false,
            deletionTime: "",
            exceptForBeyondRetentionObligations: false,
            specialDeletionConcept: false
        },
        additionalInfo: ""
    });

    const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
    const [isGenerating, setIsGenerating] = useState<boolean>(false)

    function handleTitleChange(title: string) {
        setDocumentData({...documentData, title});
    }

    function handleOrganizationChange(field: string, value: string) {
        setDocumentData({
            ...documentData,
            organization: {
                ...documentData.organization,
                [field]: value
            }
        });
    }

    function handleOrganizationContactChange(field: string, value: string) {
        setDocumentData({
            ...documentData,
            organization: {
                ...documentData.organization,
                contact: {
                    ...documentData.organization.contact,
                    [field]: value
                }
            }
        });
    }

    function handlePurposeChange(purpose: string) {
        setDocumentData({...documentData, purposeOfDataProcessing: purpose});
    }

    function handleTechnicalMeasuresChange(measures: string) {
        setDocumentData({...documentData, technicalOrganizationalMeasures: measures});
    }

    function handleLegalBasisChange(basis: string, value: boolean | string) {
        setDocumentData({
            ...documentData,
            legalBasis: {
                ...documentData.legalBasis,
                [basis]: value
            }
        });
    }

    function handleDataSourceChange(source: string, value: boolean | string) {
        setDocumentData({
            ...documentData,
            categories: {
                ...documentData.categories,
                dataSources: {
                    ...documentData.categories.dataSources,
                    [source]: value
                }
            }
        });
    }

    function handleDataCategoryChange(category: string, subcategory: string, checked: boolean) {
        setDocumentData({
            ...documentData,
            categories: {
                ...documentData.categories,
                dataCategories: {
                    ...documentData.categories.dataCategories,
                    [category]: {
                        ...documentData.categories.dataCategories[category as keyof typeof documentData.categories.dataCategories],
                        [subcategory]: checked
                    }
                }
            }
        });
    }

    function handleDataCategoryOtherChange(value: string) {
        setDocumentData({
            ...documentData,
            categories: {
                ...documentData.categories,
                dataCategories: {
                    ...documentData.categories.dataCategories,
                    other: {
                        ...documentData.categories.dataCategories.other,
                        other: value
                    }
                }
            }
        });
    }

    function handlePersonCategoryChange(category: string, subcategory: string, checked: boolean) {
        if (category === 'other') {
            // Handle the 'other' field which is a string, not an object
            return;
        }

        setDocumentData({
            ...documentData,
            categories: {
                ...documentData.categories,
                persons: {
                    ...documentData.categories.persons,
                    [category]: {
                        ...(documentData.categories.persons[category as keyof typeof documentData.categories.persons] as unknown as Record<string, boolean>),
                        [subcategory]: checked
                    }
                }
            }
        });
    }

    function handlePersonCategoryOtherChange(value: string) {
        setDocumentData({
            ...documentData,
            categories: {
                ...documentData.categories,
                persons: {
                    ...documentData.categories.persons,
                    other: value
                }
            }
        });
    }

    function handleRetentionPeriodChange(field: string, value: string | boolean) {
        setDocumentData({
            ...documentData,
            retentionPeriods: {
                ...documentData.retentionPeriods,
                [field]: value
            }
        });
    }

    function handleAdditionalInfoChange(additionalInfo: string) {
        setDocumentData({...documentData, additionalInfo});
    }

    // Helper function to get translated label for checkbox options
    function getTranslatedLabel(category: string, key: string): string {
        const labelMappings: Record<string, string> = {
            // Legal basis labels
            'legalBasis': 'legalBasisLabels',
            // Data source labels
            'dataSources': 'dataSourceLabels',
            // Data category labels
            // 'thirdCountryTransfers': 'thirdCountryTransferLabels',
            'personalData': 'personalDataLabels',
            'employment': 'employmentLabels',
            'finance': 'financeLabels',
            'health': 'healthLabels',
            'legal': 'legalLabels',
            'behavior': 'behaviorLabels',
            'documentationAndRecords': 'documentationLabels',
            'vehicle': 'vehicleLabels',
            'other': 'otherLabels',
            // Person category labels
            'affectedPersons': 'affectedPersonsLabels',
            'internalRecipientCategories': 'internalRecipientsLabels',
            'externalRecipientCategoriesEU': 'externalRecipientsEULabels',
            //'externalRecipientCategoriesThirdCountry': 'externalRecipientsThirdCountryLabels',
            'authorizedPersons': 'authorizedPersonsLabels',
            // Retention period labels
            'retentionPeriods': 'retentionLabels'
        };

        const labelKey = labelMappings[category];
        if (labelKey) {
            try {
                // @ts-ignore - Dynamic key access for translations
                return t(`${labelKey}.${key}`) || key.replace(/([A-Z])/g, ' $1').trim();
            } catch {
                return key.replace(/([A-Z])/g, ' $1').trim();
            }
        }
        return key.replace(/([A-Z])/g, ' $1').trim();
    }

    // Helper function to get translated category header
    function getTranslatedCategoryHeader(categoryKey: string): string {
        try {
            // @ts-ignore - Dynamic key access for translations
            return t(`categoryHeaders.${categoryKey}`) || categoryKey.replace(/([A-Z])/g, ' $1').trim();
        } catch {
            return categoryKey.replace(/([A-Z])/g, ' $1').trim();
        }
    }

    async function handleGenerateDocument() {
        setIsGenerating(true);
        const generatedDocument = await callLLMapi(documentData, t("locale"), selectedModel);
        setIsGenerating(false);
        setGeneratedDocument(generatedDocument)
    }

    function AISuggestButton({ onClick, disabled }: { onClick: () => void, disabled: boolean }) {
        return (
            <Button variant="outline" onClick={onClick} disabled={disabled} className="flex items-center gap-2 ml-2">
                <Sparkles className="w-4 h-4" />
                AI Suggest
            </Button>
        );
    }

    return (
        <div className="space-y-6 w-full">
            <RopaTemplateSelector onSelect={setGeneratedDocument}></RopaTemplateSelector>

            {/* Title Card (excluded) */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("info")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t("infoTitle")}</Label>
                            <Input
                                id="title"
                                placeholder={t("infoPlaceholder")}
                                value={documentData.title}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Organization Card (excluded) */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("organization")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">{t("organizationName")}</Label>
                            <Input
                                id="orgName"
                                placeholder={t("organizationNamePlaceholder")}
                                value={documentData.organization.name}
                                onChange={(e) => handleOrganizationChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgRole">{t("organizationRole")}</Label>
                            <Input
                                id="orgRole"
                                placeholder={t("organizationRolePlaceholder")}
                                value={documentData.organization.role}
                                onChange={(e) => handleOrganizationChange('role', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="orgAddress">{t("organizationAddress")}</Label>
                                <Input
                                    id="orgAddress"
                                    placeholder={t("organizationAddressPlaceholder")}
                                    value={documentData.organization.contact.address}
                                    onChange={(e) => handleOrganizationContactChange('address', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgEmail">{t("organizationEmail")}</Label>
                                <Input
                                    id="orgEmail"
                                    type="email"
                                    placeholder={t("organizationEmailPlaceholder")}
                                    value={documentData.organization.contact.email}
                                    onChange={(e) => handleOrganizationContactChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgPhone">{t("organizationPhone")}</Label>
                                <Input
                                    id="orgPhone"
                                    placeholder={t("organizationPhonePlaceholder")}
                                    value={documentData.organization.contact.phone}
                                    onChange={(e) => handleOrganizationContactChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgRepresentative">{t("organizationRepresentative")}</Label>
                            <Input
                                id="orgRepresentative"
                                placeholder={t("organizationRepresentativePlaceholder")}
                                value={documentData.organization.representative}
                                onChange={(e) => handleOrganizationChange('representative', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgDpo">{t("organizationDpo")}</Label>
                            <Input
                                id="orgDpo"
                                placeholder={t("organizationDpoPlaceholder")}
                                value={documentData.organization.dpo}
                                onChange={(e) => handleOrganizationChange('dpo', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Purpose of Data Processing */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("purposeOfDataProcessing")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for purpose */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Textarea
                            placeholder={t("purposeOfDataProcessingPlaceholder")}
                            className="min-h-[100px]"
                            value={documentData.purposeOfDataProcessing}
                            onChange={(e) => handlePurposeChange(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Technical and Organizational Measures */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("technicalOrganizationalMeasures")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for measures */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Textarea
                            placeholder={t("technicalOrganizationalMeasuresPlaceholder")}
                            className="min-h-[100px]"
                            value={documentData.technicalOrganizationalMeasures}
                            onChange={(e) => handleTechnicalMeasuresChange(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Legal Basis */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("legalBasis")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for legal basis */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(documentData.legalBasis).filter(([key]) => key !== 'other').map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) => handleLegalBasisChange(key, checked === true)}
                                />
                                <Label htmlFor={key} className="cursor-pointer">
                                    {getTranslatedLabel('legalBasis', key)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="legalBasisOther">{t("otherLegalBasis")}</Label>
                        <Input
                            id="legalBasisOther"
                            placeholder={t("otherLegalBasisPlaceholder")}
                            value={documentData.legalBasis.other}
                            onChange={(e) => handleLegalBasisChange('other', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("dataSources")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for data sources */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(documentData.categories.dataSources).filter(([key]) => key !== 'other').map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) => handleDataSourceChange(key, checked === true)}
                                />
                                <Label htmlFor={key} className="cursor-pointer">
                                    {getTranslatedLabel('dataSources', key)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="dataSourcesOther">{t("otherDataSources")}</Label>
                        <Input
                            id="dataSourcesOther"
                            placeholder={t("otherDataSourcesPlaceholder")}
                            value={documentData.categories.dataSources.other}
                            onChange={(e) => handleDataSourceChange('other', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Categories */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("dataCategories")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for data categories */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {Object.entries(documentData.categories.dataCategories).filter(([key]) => key !== 'other' || key === 'other').map(([categoryKey, categoryValue]) => (
                            <div key={categoryKey} className="space-y-3">
                                <h4 className="font-medium capitalize">{getTranslatedCategoryHeader(categoryKey)}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                                    {Object.entries(categoryValue).filter(([subKey]) => subKey !== 'other').map(([subKey, subValue]) => (
                                        <div key={subKey} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${categoryKey}-${subKey}`}
                                                checked={subValue as boolean}
                                                onCheckedChange={(checked) => handleDataCategoryChange(categoryKey, subKey, checked === true)}
                                            />
                                            <Label htmlFor={`${categoryKey}-${subKey}`} className="cursor-pointer">
                                                {getTranslatedLabel(categoryKey, subKey)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {categoryKey === 'other' && (
                                    <div className="pl-4 space-y-2">
                                        <Label htmlFor="dataCategoriesOther">{t("otherDataCategories")}</Label>
                                        <Input
                                            id="dataCategoriesOther"
                                            placeholder={t("otherDataCategoriesPlaceholder")}
                                            value={documentData.categories.dataCategories.other.other}
                                            onChange={(e) => handleDataCategoryOtherChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Person Categories */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("personCategories")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for person categories */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {Object.entries(documentData.categories.persons).filter(([key]) => key !== 'other').map(([categoryKey, categoryValue]) => (
                                <div key={categoryKey} className="space-y-3">
                                    <h4 className="font-medium capitalize">{getTranslatedCategoryHeader(categoryKey)}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                                        {Object.entries(categoryValue).map(([subKey, subValue]) => (
                                            <div key={subKey} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${categoryKey}-${subKey}`}
                                                    checked={subValue as boolean}
                                                    onCheckedChange={(checked) => handlePersonCategoryChange(categoryKey, subKey, checked === true)}
                                                />
                                                <Label htmlFor={`${categoryKey}-${subKey}`} className="cursor-pointer">
                                                    {getTranslatedLabel(categoryKey, subKey)}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        <div className="space-y-2">
                            <Label htmlFor="personCategoriesOther">{t("otherPersonCategories")}</Label>
                            <Input
                                id="personCategoriesOther"
                                placeholder={t("otherPersonCategoriesPlaceholder")}
                                value={documentData.categories.persons.other}
                                onChange={(e) => handlePersonCategoryOtherChange(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Retention Periods */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("retentionPeriods")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for retention periods */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(documentData.retentionPeriods).filter(([key]) => key !== 'deletionTime').map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={value as boolean}
                                        onCheckedChange={(checked) => handleRetentionPeriodChange(key, checked === true)}
                                    />
                                    <Label htmlFor={key} className="cursor-pointer">
                                        {getTranslatedLabel('retentionPeriods', key)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deletionTime">{t("deletionTime")}</Label>
                            <Input
                                id="deletionTime"
                                placeholder={t("deletionTimePlaceholder")}
                                value={documentData.retentionPeriods.deletionTime}
                                onChange={(e) => handleRetentionPeriodChange('deletionTime', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("additionalInfo")}</CardTitle>
                    <AISuggestButton onClick={() => {/* TODO: handle AI suggest for additional info */}} disabled={!documentData.title} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                id="additionalInfo"
                                placeholder={t("additionalInfoPlaceholder")}
                                className="min-h-[150px]"
                                value={documentData.additionalInfo}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleAdditionalInfoChange(e.target.value)}
                            />
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <div className="">
                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger id="model-select">
                                        <SelectValue placeholder="AI model"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableModels.map((model) => (
                                            <SelectItem key={model.name} value={model.name}>
                                                {model.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-auto flex items-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t("generating")}
                                    </>
                                ) : (
                                    t("generateButton")
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
