export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6  rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  )
}
