import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useTranslations } from "next-intl";
import { DocumentData } from "@/models/DocumentData";

interface SectionInputProps {
    section: string;
    documentData: DocumentData;
    onChange: (section: string, value: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function SectionInput({ section, documentData, onChange, disabled, className }: SectionInputProps) {
    const t = useTranslations('Generate');

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
        const sectionName = t(section as any);
        return t('inputPlaceholder', { section: sectionName });
    }

    const value = getSectionInputValue(section);
    const placeholder = getSectionPlaceholder(section);


    return (
        <>

            <Input
                className={className}
                value={value}
                onChange={(e) => onChange(section, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
            />
        </>
    );
}
