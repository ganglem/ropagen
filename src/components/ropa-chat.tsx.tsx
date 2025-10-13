"use client";

import {ChangeEvent, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {callAPI} from "@/actions/actions";
import { Loader2, Send } from "lucide-react"
import RopaTemplateSelector from "./ropa-template-selector";
import {useTranslations} from "next-intl";
import { availableModels, defaultModel } from "@/config/models";
import { DocumentData } from "@/models/DocumentData";
import SectionChat from "./section-chat";

export default function RopaForm({setGeneratedDocument}: {setGeneratedDocument: (doc: string) => void}) {

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
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [aiSuggestLoading, setAiSuggestLoading] = useState<Record<string, boolean>>({});

    // Check if any AI suggest is currently loading
    const isAnyAiSuggestLoading = Object.values(aiSuggestLoading).some(loading => loading);

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
        const generatedDocument = await callAPI(documentData, t("locale"), "finalropa", selectedModel);
        setIsGenerating(false);
        setGeneratedDocument(generatedDocument)
    }

    async function handleAiSuggest(source: string) {
        setAiSuggestLoading({...aiSuggestLoading, [source]: true});
        try {
            const suggestion = await callAPI(documentData, t("locale"), source, selectedModel);

            // Apply the suggestion based on the source
            switch (source) {
                case 'purposeOfDataProcessing':
                    if (suggestion.purposeOfDataProcessing) {
                        setDocumentData({...documentData, purposeOfDataProcessing: suggestion.purposeOfDataProcessing});
                    }
                    break;
                case 'technicalOrganizationalMeasures':
                    if (suggestion.technicalOrganizationalMeasures) {
                        setDocumentData({...documentData, technicalOrganizationalMeasures: suggestion.technicalOrganizationalMeasures});
                    }
                    break;
                case 'legalBasis':
                    if (suggestion.legalBasis) {
                        setDocumentData({...documentData, legalBasis: suggestion.legalBasis});
                    }
                    break;
                case 'dataSources':
                    if (suggestion.dataSources) {
                        setDocumentData({
                            ...documentData,
                            categories: {
                                ...documentData.categories,
                                dataSources: suggestion.dataSources
                            }
                        });
                    }
                    break;
                case 'dataCategories':
                    if (suggestion.dataCategories) {
                        setDocumentData({
                            ...documentData,
                            categories: {
                                ...documentData.categories,
                                dataCategories: suggestion.dataCategories
                            }
                        });
                    }
                    break;
                case 'personCategories':
                    if (suggestion.persons) {
                        setDocumentData({
                            ...documentData,
                            categories: {
                                ...documentData.categories,
                                persons: suggestion.persons
                            }
                        });
                    }
                    break;
                case 'retentionPeriods':
                    if (suggestion.retentionPeriods) {
                        setDocumentData({...documentData, retentionPeriods: suggestion.retentionPeriods});
                    }
                    break;
                case 'additionalInfo':
                    if (suggestion.additionalInfo) {
                        setDocumentData({...documentData, additionalInfo: suggestion.additionalInfo});
                    }
                    break;
            }
        } catch (error) {
            console.error('AI suggestion failed:', error);
            // You might want to show an error toast here
        } finally {
            setAiSuggestLoading({...aiSuggestLoading, [source]: false});
        }
    }

    function handleDataUpdate(source: string, updatedData: any) {
        switch (source) {
            case 'purposeOfDataProcessing':
                if (updatedData.purposeOfDataProcessing) {
                    setDocumentData({...documentData, purposeOfDataProcessing: updatedData.purposeOfDataProcessing});
                }
                break;
            case 'technicalOrganizationalMeasures':
                if (updatedData.technicalOrganizationalMeasures) {
                    setDocumentData({...documentData, technicalOrganizationalMeasures: updatedData.technicalOrganizationalMeasures});
                }
                break;
            case 'legalBasis':
                if (updatedData.legalBasis) {
                    setDocumentData({...documentData, legalBasis: updatedData.legalBasis});
                }
                break;
            case 'dataSources':
                if (updatedData.dataSources) {
                    setDocumentData({
                        ...documentData,
                        categories: {
                            ...documentData.categories,
                            dataSources: updatedData.dataSources
                        }
                    });
                }
                break;
            case 'dataCategories':
                if (updatedData.dataCategories) {
                    setDocumentData({
                        ...documentData,
                        categories: {
                            ...documentData.categories,
                            dataCategories: updatedData.dataCategories
                        }
                    });
                }
                break;
            case 'personCategories':
                if (updatedData.persons) {
                    setDocumentData({
                        ...documentData,
                        categories: {
                            ...documentData.categories,
                            persons: updatedData.persons
                        }
                    });
                }
                break;
            case 'retentionPeriods':
                if (updatedData.retentionPeriods) {
                    setDocumentData({...documentData, retentionPeriods: updatedData.retentionPeriods});
                }
                break;
            case 'additionalInfo':
                if (updatedData.additionalInfo) {
                    setDocumentData({...documentData, additionalInfo: updatedData.additionalInfo});
                }
                break;
        }
    }

    function AskAISection({ source }: { source: string }) {
        const isLoading = aiSuggestLoading[source];

        const handleAskAI = async () => {
            setAiSuggestLoading({...aiSuggestLoading, [source]: true});
            try {
                const suggestion = await callAPI(documentData, t("locale"), source, selectedModel);

                // Apply the suggestion based on the source
                switch (source) {
                    case 'purposeOfDataProcessing':
                        if (suggestion.purposeOfDataProcessing) {
                            setDocumentData({...documentData, purposeOfDataProcessing: suggestion.purposeOfDataProcessing});
                        }
                        break;
                    case 'technicalOrganizationalMeasures':
                        if (suggestion.technicalOrganizationalMeasures) {
                            setDocumentData({...documentData, technicalOrganizationalMeasures: suggestion.technicalOrganizationalMeasures});
                        }
                        break;
                    case 'legalBasis':
                        if (suggestion.legalBasis) {
                            setDocumentData({...documentData, legalBasis: suggestion.legalBasis});
                        }
                        break;
                    case 'dataSources':
                        if (suggestion.dataSources) {
                            setDocumentData({
                                ...documentData,
                                categories: {
                                    ...documentData.categories,
                                    dataSources: suggestion.dataSources
                                }
                            });
                        }
                        break;
                    case 'dataCategories':
                        if (suggestion.dataCategories) {
                            setDocumentData({
                                ...documentData,
                                categories: {
                                    ...documentData.categories,
                                    dataCategories: suggestion.dataCategories
                                }
                            });
                        }
                        break;
                    case 'personCategories':
                        if (suggestion.persons) {
                            setDocumentData({
                                ...documentData,
                                categories: {
                                    ...documentData.categories,
                                    persons: suggestion.persons
                                }
                            });
                        }
                        break;
                    case 'retentionPeriods':
                        if (suggestion.retentionPeriods) {
                            setDocumentData({...documentData, retentionPeriods: suggestion.retentionPeriods});
                        }
                        break;
                    case 'additionalInfo':
                        if (suggestion.additionalInfo) {
                            setDocumentData({...documentData, additionalInfo: suggestion.additionalInfo});
                        }
                        break;
                }
            } catch (error) {
                console.error('AI question failed:', error);
            } finally {
                setAiSuggestLoading({...aiSuggestLoading, [source]: false});
            }
        };

        return (
            <CardContent>
                <div className="flex gap-2">
                    <Button
                        onClick={handleAskAI}
                        disabled={isAnyAiSuggestLoading || !documentData.title}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {t("askAI")}
                    </Button>
                </div>
            </CardContent>
        );
    }

    function handleTemplateSelect(template: DocumentData) {
        setDocumentData(template);
    }

    return (
        <div className="space-y-6 w-full">
            <RopaTemplateSelector onSelect={handleTemplateSelect}></RopaTemplateSelector>

            {/* Title Card */}
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
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Organization Card */}
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
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgRole">{t("organizationRole")}</Label>
                            <Input
                                id="orgRole"
                                placeholder={t("organizationRolePlaceholder")}
                                value={documentData.organization.role}
                                onChange={(e) => handleOrganizationChange('role', e.target.value)}
                                disabled={isGenerating || isAnyAiSuggestLoading}
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
                                    disabled={isGenerating || isAnyAiSuggestLoading}
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
                                    disabled={isGenerating || isAnyAiSuggestLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgPhone">{t("organizationPhone")}</Label>
                                <Input
                                    id="orgPhone"
                                    placeholder={t("organizationPhonePlaceholder")}
                                    value={documentData.organization.contact.phone}
                                    onChange={(e) => handleOrganizationContactChange('phone', e.target.value)}
                                    disabled={isGenerating || isAnyAiSuggestLoading}
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
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgDpo">{t("organizationDpo")}</Label>
                            <Input
                                id="orgDpo"
                                placeholder={t("organizationDpoPlaceholder")}
                                value={documentData.organization.dpo}
                                onChange={(e) => handleOrganizationChange('dpo', e.target.value)}
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Purpose of Data Processing */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("purposeOfDataProcessing")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="purposeOfDataProcessing"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('purposeOfDataProcessing', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Technical and Organizational Measures */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("technicalOrganizationalMeasures")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="technicalOrganizationalMeasures"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('technicalOrganizationalMeasures', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Legal Basis */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("legalBasis")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="legalBasis"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('legalBasis', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Data Sources */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("dataSources")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="dataSources"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('dataSources', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Data Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("dataCategories")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="dataCategories"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('dataCategories', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Person Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("personCategories")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="personCategories"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('personCategories', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Retention Periods */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("retentionPeriods")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="retentionPeriods"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('retentionPeriods', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("additionalInfo")}</CardTitle>
                </CardHeader>
                <SectionChat
                    source="additionalInfo"
                    documentData={documentData}
                    onDataUpdate={(data) => handleDataUpdate('additionalInfo', data)}
                    selectedModel={selectedModel}
                    disabled={isGenerating || isAnyAiSuggestLoading}
                />
                <CardContent>
                    <div className="space-y-4">
                        <div className="w-full flex items-center justify-between">
                            <div className="">
                                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isAnyAiSuggestLoading || isGenerating}>
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

                            <Button onClick={handleGenerateDocument} disabled={isGenerating || isAnyAiSuggestLoading} className="w-auto flex items-center gap-2">
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
