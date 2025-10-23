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

export default function RopaExplain({setGeneratedDocument}: {setGeneratedDocument: (doc: string) => void}) {

    const t = useTranslations('Generate');

    // Define sections configuration
    const sections = [
        'purposeOfDataProcessing',
        'technicalOrganizationalMeasures',
        'legalBasis',
        'dataSources',
        'dataCategories',
        'personCategories',
        'retentionPeriods',
        'additionalInfo'
    ];

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
    const [activeChatStates, setActiveChatStates] = useState<Record<string, boolean>>({});

    // Check if any AI suggest is currently loading
    const isAnyAiSuggestLoading = Object.values(aiSuggestLoading).some(loading => loading);

    // Check if any chat is currently active
    const isAnyChatActive = Object.values(activeChatStates).some(active => active);

    function handleTitleChange(title: string) {
        setDocumentData({...documentData, title});
    }

    function handleSectionInputChange(section: string, value: string) {
        if (section === 'retentionPeriods') {
            setDocumentData({
                ...documentData,
                retentionPeriods: {
                    ...documentData.retentionPeriods,
                    deletionTime: value
                }
            });
        } else if (section === 'legalBasis') {
            setDocumentData({
                ...documentData,
                legalBasis: {
                    ...documentData.legalBasis,
                    other: value
                }
            });
        } else if (section === 'dataSources') {
            setDocumentData({
                ...documentData,
                categories: {
                    ...documentData.categories,
                    dataSources: {
                        ...documentData.categories.dataSources,
                        other: value
                    }
                }
            });
        } else if (section === 'dataCategories') {
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
        } else if (section === 'personCategories') {
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
        } else {
            // For simple string fields like purposeOfDataProcessing, technicalOrganizationalMeasures, additionalInfo
            setDocumentData({
                ...documentData,
                [section]: value
            });
        }
    }

    function getSectionInputValue(section: string): string {
        if (section === 'retentionPeriods') {
            return documentData.retentionPeriods.deletionTime;
        } else if (section === 'legalBasis') {
            return documentData.legalBasis.other;
        } else if (section === 'dataSources') {
            return documentData.categories.dataSources.other;
        } else if (section === 'dataCategories') {
            return documentData.categories.dataCategories.other.other;
        } else if (section === 'personCategories') {
            return documentData.categories.persons.other;
        } else {
            // For simple string fields
            return (documentData as any)[section] || '';
        }
    }

    function getSectionPlaceholder(section: string): string {
        if (section === 'retentionPeriods') {
            return t('deletionTimePlaceholder');
        } else if (section === 'legalBasis') {
            return t('otherLegalBasisPlaceholder');
        } else if (section === 'dataSources') {
            return t('otherDataSourcesPlaceholder');
        } else if (section === 'dataCategories') {
            return t('otherDataCategoriesPlaceholder');
        } else if (section === 'personCategories') {
            return t('otherPersonCategoriesPlaceholder');
        } else if (section === 'purposeOfDataProcessing') {
            return t('purposeOfDataProcessingPlaceholder');
        } else if (section === 'technicalOrganizationalMeasures') {
            return t('technicalOrganizationalMeasuresPlaceholder');
        } else if (section === 'additionalInfo') {
            return t('additionalInfoPlaceholder');
        } else {
            return '';
        }
    }

    function handleChatStateChange(section: string, isActive: boolean) {
        setActiveChatStates(prev => ({
            ...prev,
            [section]: isActive
        }));
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

    async function handleGenerateDocument() {
        setIsGenerating(true);
        const generatedDocument = await callAPI(documentData, t("locale"), "finalropa", selectedModel);
        setIsGenerating(false);
        setGeneratedDocument(generatedDocument)
    }

    return (
        <div className="space-y-6 w-full">

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
                                disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
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
                                disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgRole">{t("organizationRole")}</Label>
                            <Input
                                id="orgRole"
                                placeholder={t("organizationRolePlaceholder")}
                                value={documentData.organization.role}
                                onChange={(e) => handleOrganizationChange('role', e.target.value)}
                                disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
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
                                    disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
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
                                    disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgPhone">{t("organizationPhone")}</Label>
                                <Input
                                    id="orgPhone"
                                    placeholder={t("organizationPhonePlaceholder")}
                                    value={documentData.organization.contact.phone}
                                    onChange={(e) => handleOrganizationContactChange('phone', e.target.value)}
                                    disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
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
                                disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgDpo">{t("organizationDpo")}</Label>
                            <Input
                                id="orgDpo"
                                placeholder={t("organizationDpoPlaceholder")}
                                value={documentData.organization.dpo}
                                onChange={(e) => handleOrganizationChange('dpo', e.target.value)}
                                disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Section Cards */}
            {sections.map((section) => (
                <Card key={section}>
                    <CardHeader>
                        <CardTitle>{t(section as any)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SectionChat
                            source={section}
                            documentData={documentData}
                            selectedModel={selectedModel}
                            chatMode={"explain"}
                            disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                            onChatStateChange={handleChatStateChange}
                        />
                        <Input
                            className={"mt-4"}
                            value={getSectionInputValue(section)}
                            onChange={(e) => handleSectionInputChange(section, e.target.value)}
                            placeholder={getSectionPlaceholder(section)}
                            disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive}
                        />

                    </CardContent>
                </Card>
            ))}

            {/* Final Card with Model Selection and Generate Button */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("generateDocument")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="w-full flex items-center justify-between">
                        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isAnyAiSuggestLoading || isGenerating || isAnyChatActive}>
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
                        <Button onClick={handleGenerateDocument} disabled={isGenerating || isAnyAiSuggestLoading || isAnyChatActive} className="w-auto flex items-center gap-2">
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
                </CardContent>
            </Card>
        </div>
    )
}
