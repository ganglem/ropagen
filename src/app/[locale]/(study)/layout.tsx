export default async function StudyGenerateLayout({
    children
}: {
    children: React.ReactNode
}) {

    return <main className="flex-grow">{children}</main>
}