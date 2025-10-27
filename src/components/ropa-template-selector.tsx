"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {fetchMockTemplates} from "@/actions/actions"
import {DocumentData, Template} from "@/models/DocumentData"
import {useTranslations, useLocale} from "next-intl";


export default function RopaTemplateSelector({onSelect}: {
    onSelect: (template: DocumentData) => void }){

    const t = useTranslations('Generate');
    const locale = useLocale();

    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none")

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const data = await fetchMockTemplates(locale)
                console.log(data)
                setTemplates(data)
            } catch (error) {
                console.error("Error loading templates:", error)
            }
        }
        loadTemplates()
    }, [locale])

    const getEmptyTemplate = (): DocumentData => ({
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
    })

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId)

        if (templateId === "none") {
            onSelect(getEmptyTemplate())
            return
        }

        const selectedTemplate = templates.find((t) => t.id === templateId)
        if (selectedTemplate) {
            onSelect({
                id: selectedTemplate.id,
                title: selectedTemplate.title,
                organization: selectedTemplate.organization,
                processors: selectedTemplate.processors,
                technicalOrganizationalMeasures: selectedTemplate.technicalOrganizationalMeasures,
                purposeOfDataProcessing: selectedTemplate.purposeOfDataProcessing,
                legalBasis: selectedTemplate.legalBasis,
                categories: selectedTemplate.categories,
                retentionPeriods: selectedTemplate.retentionPeriods,
                // thirdCountryTransfers: selectedTemplate.thirdCountryTransfers,
                additionalInfo: selectedTemplate.additionalInfo,
                language: selectedTemplate.language,
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("templateInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("templatePlaceholder")}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t("templatePlaceholder")}</SelectItem>
                            {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
