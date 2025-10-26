"use client";

import {ChangeEvent, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {callAPI} from "@/actions/actions";
import { Loader2, Info } from "lucide-react"
import RopaTemplateSelector from "./ropa-template-selector";
import {useTranslations} from "next-intl";
import { availableModels, defaultModel } from "@/config/models";
import { DocumentData } from "@/models/DocumentData";
import { Sparkles } from "lucide-react";
import SectionInput from "./section-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

    function handleSectionChange(section: string, value: string) {
        if (section === 'purposeOfDataProcessing') {
            setDocumentData({...documentData, purposeOfDataProcessing: value});
        } else if (section === 'technicalOrganizationalMeasures') {
            setDocumentData({...documentData, technicalOrganizationalMeasures: value});
        } else if (section === 'additionalInfo') {
            setDocumentData({...documentData, additionalInfo: value});
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
        } else if (section === 'retentionPeriods') {
            setDocumentData({
                ...documentData,
                retentionPeriods: {
                    ...documentData.retentionPeriods,
                    deletionTime: value
                }
            });
        }
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

    function handleRetentionPeriodChange(field: string, value: string | boolean) {
        setDocumentData({
            ...documentData,
            retentionPeriods: {
                ...documentData.retentionPeriods,
                [field]: value
            }
        });
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
        const generatedDocument = await callAPI(documentData, t("locale"), 'finalropa', selectedModel);
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

    function AISuggestButton({ onClick, disabled, source }: { onClick: () => void, disabled: boolean, source: string }) {
        const isLoading = aiSuggestLoading[source];
        const isTitleMissing = !documentData.title.trim();
        const isButtonDisabled = disabled || isLoading || isAnyAiSuggestLoading;

        return (
            <div
                className="relative inline-block"
                title={isButtonDisabled && isTitleMissing ? t("aiSuggestTooltip") : ""}
            >
                <Button
                    variant="outline"
                    onClick={onClick}
                    disabled={isButtonDisabled}
                    className="flex items-center gap-2 ml-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {t("aiSuggest")}
                </Button>
            </div>
        );
    }

    function handleTemplateSelect(template: DocumentData) {
        setDocumentData(template);
    }

    // Info button component with tooltip
    function InfoTooltip({ tooltipKey }: { tooltipKey: string }) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full ml-2 hover:bg-accent transition-colors"
                        type="button"
                    >
                        <Info className="w-full h-full" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p>{t(`tooltips.${tooltipKey}`)}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    // Define sections for map-based rendering
    const textSections = [
        { key: 'purposeOfDataProcessing', title: t("purposeOfDataProcessing") },
        { key: 'technicalOrganizationalMeasures', title: t("technicalOrganizationalMeasures") },
    ];

    return (
        <div className="space-y-6 w-full">
            <RopaTemplateSelector onSelect={handleTemplateSelect}></RopaTemplateSelector>

            {/* Title Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {t("info")}
                        <InfoTooltip tooltipKey="info" />
                    </CardTitle>
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
                    <CardTitle className="flex items-center">
                        {t("organization")}
                        <InfoTooltip tooltipKey="organization" />
                    </CardTitle>
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

            {/* Text sections using map */}
            {textSections.map(section => (
                <Card key={section.key}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center">
                            <CardTitle>{section.title}</CardTitle>
                            <InfoTooltip tooltipKey={section.key} />
                        </div>
                        <AISuggestButton onClick={() => handleAiSuggest(section.key)} disabled={!documentData.title} source={section.key} />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <SectionInput
                                section={section.key}
                                documentData={documentData}
                                onChange={handleSectionChange}
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Legal Basis */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <CardTitle>{t("legalBasis")}</CardTitle>
                        <InfoTooltip tooltipKey="legalBasis" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('legalBasis')} disabled={!documentData.title} source="legalBasis" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(documentData.legalBasis).filter(([key]) => key !== 'other').map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) => handleLegalBasisChange(key, checked === true)}
                                    disabled={isGenerating || isAnyAiSuggestLoading}
                                />
                                <Label htmlFor={key} className="cursor-pointer">
                                    {getTranslatedLabel('legalBasis', key)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="legalBasisOther">{t("otherLegalBasis")}</Label>
                        <SectionInput
                            section="legalBasis"
                            documentData={documentData}
                            onChange={handleSectionChange}
                            disabled={isGenerating || isAnyAiSuggestLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <CardTitle>{t("dataSources")}</CardTitle>
                        <InfoTooltip tooltipKey="dataSources" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('dataSources')} disabled={!documentData.title} source="dataSources" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(documentData.categories.dataSources).filter(([key]) => key !== 'other').map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) => handleDataSourceChange(key, checked === true)}
                                    disabled={isGenerating || isAnyAiSuggestLoading}
                                />
                                <Label htmlFor={key} className="cursor-pointer">
                                    {getTranslatedLabel('dataSources', key)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="dataSourcesOther">{t("otherDataSources")}</Label>
                        <SectionInput
                            section="dataSources"
                            documentData={documentData}
                            onChange={handleSectionChange}
                            disabled={isGenerating || isAnyAiSuggestLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Categories */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <CardTitle>{t("dataCategories")}</CardTitle>
                        <InfoTooltip tooltipKey="dataCategories" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('dataCategories')} disabled={!documentData.title} source="dataCategories" />
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
                                                disabled={isGenerating || isAnyAiSuggestLoading}
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
                                        <SectionInput
                                            section="dataCategories"
                                            documentData={documentData}
                                            onChange={handleSectionChange}
                                            disabled={isGenerating || isAnyAiSuggestLoading}
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
                    <div className="flex items-center">
                        <CardTitle>{t("personCategories")}</CardTitle>
                        <InfoTooltip tooltipKey="personCategories" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('personCategories')} disabled={!documentData.title} source="personCategories" />
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
                                                    disabled={isGenerating || isAnyAiSuggestLoading}
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
                            <SectionInput
                                section="personCategories"
                                documentData={documentData}
                                onChange={handleSectionChange}
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Retention Periods */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <CardTitle>{t("retentionPeriods")}</CardTitle>
                        <InfoTooltip tooltipKey="retentionPeriods" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('retentionPeriods')} disabled={!documentData.title} source="retentionPeriods" />
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
                                        disabled={isGenerating || isAnyAiSuggestLoading}
                                    />
                                    <Label htmlFor={key} className="cursor-pointer">
                                        {getTranslatedLabel('retentionPeriods', key)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deletionTime">{t("deletionTime")}</Label>
                            <SectionInput
                                section="retentionPeriods"
                                documentData={documentData}
                                onChange={handleSectionChange}
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <CardTitle>{t("additionalInfo")}</CardTitle>
                        <InfoTooltip tooltipKey="additionalInfo" />
                    </div>
                    <AISuggestButton onClick={() => handleAiSuggest('additionalInfo')} disabled={!documentData.title} source="additionalInfo" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <SectionInput
                                section="additionalInfo"
                                documentData={documentData}
                                onChange={handleSectionChange}
                                disabled={isGenerating || isAnyAiSuggestLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Final Card with Model Selection and Generate Button */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {t("generateDocument")}
                        <InfoTooltip tooltipKey="generateDocument" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="w-full flex items-center justify-between">
                        <div className="">
                            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isGenerating || isAnyAiSuggestLoading}>
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
                </CardContent>
            </Card>
        </div>
    )
}
