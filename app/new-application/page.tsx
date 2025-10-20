"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  citationNumber: z.string().optional(),
  court: z.object({
    magisterialDistrictCourt: z.string().optional(),
    docketNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().length(2, "State must be 2 characters").optional().or(z.literal("")),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, "Invalid zip code")
      .optional()
      .or(z.literal("")),
  }),
  case: z.object({
    socialSecurityNumber: z
      .string()
      .regex(/^\d{3}-\d{2}-\d{4}$/, "SSN format: XXX-XX-XXXX")
      .optional()
      .or(z.literal("")),
    incidentCadCaseNumber: z.string().optional(),
    caseInstitutedBy: z.string().optional(),
  }),
  defendant: z.object({
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    suffix: z.string().optional(),
    driversNumber: z.string().optional(),
    driversLicenseState: z.string().length(2, "State must be 2 characters").optional().or(z.literal("")),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().length(2, "State must be 2 characters").optional().or(z.literal("")),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, "Invalid zip code")
      .optional()
      .or(z.literal("")),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    sex: z.enum(["M", "F", ""]).optional(),
    dateOfBirth: z.string().optional(),
    residentStatus: z.string().optional(),
    signature: z.string().optional(),
    signatureDate: z.string().optional(),
  }),
  juvenile: z.object({
    isJuvenile: z.boolean().optional(),
    parentsNotified: z.boolean().optional(),
    parentFirstName: z.string().optional(),
    parentLastName: z.string().optional(),
    dateNotified: z.string().optional(),
    timeNotified: z.string().optional(),
  }),
  charge: z.object({
    charge: z.string().optional(),
    natureOfOffense: z.string().optional(),
    paCode: z.string().optional(),
    statuteOrdinance: z.string().optional(),
    section: z.string().optional(),
    subsection: z.string().optional(),
  }),
  financial: z.object({
    fine: z.string().optional(),
    costs: z.string().optional(),
    jcpAtjCjeaOag: z.string().optional(),
    totalDue: z.string().optional(),
  }),
  offense: z.object({
    offenseDate: z.string().optional(),
    offenseTime: z.string().optional(),
    offenseDay: z.string().optional(),
    labServicesRequired: z.boolean().optional(),
    offenseCode: z.string().optional(),
    propertyRecordNumber: z.string().optional(),
    systemsCode: z.string().optional(),
  }),
  location: z.object({
    county: z.string().optional(),
    countyCode: z.string().optional(),
    townshipBoroughCity: z.string().optional(),
    code: z.string().optional(),
    zone: z.string().optional(),
    initialReport: z.string().optional(),
    attnLce: z.string().optional(),
    militaryService: z.boolean().optional(),
    location: z.string().optional(),
    stationAddress: z.string().optional(),
  }),
  officer: z.object({
    signature: z.string().optional(),
    badgeNumber: z.string().optional(),
    oriNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    officerId: z.string().optional(),
    dateFiledOnInfoReceived: z.string().optional(),
  }),
  victim: z.object({
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    suffix: z.string().optional(),
    dateOfBirth: z.string().optional(),
    sex: z.enum(["M", "F", ""]).optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  additional: z.object({
    confidentialInformation: z.string().optional(),
    remarksSubpoenaList: z.string().optional(),
  }),
  metadata: z.object({
    formVersion: z.string().optional(),
    copyType: z.enum(["ORIGINAL", "DEFENDANT", "PUBLIC_ACCESS_COPY", "POLICE", ""]).optional(),
  }),
})

type FormData = z.infer<typeof formSchema>

const STEPS = [
  { id: 1, title: "Citation & Court", description: "Basic citation and court information" },
  { id: 2, title: "Case Information", description: "Case details and incident information" },
  { id: 3, title: "Defendant Details", description: "Defendant personal information" },
  { id: 4, title: "Juvenile Information", description: "Juvenile-specific details (if applicable)" },
  { id: 5, title: "Charges", description: "Charge and offense details" },
  { id: 6, title: "Financial", description: "Fines and costs" },
  { id: 7, title: "Offense Details", description: "Offense date, time, and location" },
  { id: 8, title: "Location", description: "Detailed location information" },
  { id: 9, title: "Officer Information", description: "Officer details and signature" },
  { id: 10, title: "Victim Information", description: "Victim details (if applicable)" },
  { id: 11, title: "Additional Information", description: "Confidential information and remarks" },
]

export default function NewApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationId, setApplicationId] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      citationNumber: "",
      court: {
        magisterialDistrictCourt: "",
        docketNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      case: {
        socialSecurityNumber: "",
        incidentCadCaseNumber: "",
        caseInstitutedBy: "",
      },
      defendant: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        driversNumber: "",
        driversLicenseState: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        race: "",
        ethnicity: "",
        sex: "",
        dateOfBirth: "",
        residentStatus: "",
        signature: "",
        signatureDate: "",
      },
      juvenile: {
        isJuvenile: false,
        parentsNotified: false,
        parentFirstName: "",
        parentLastName: "",
        dateNotified: "",
        timeNotified: "",
      },
      charge: {
        charge: "",
        natureOfOffense: "",
        paCode: "",
        statuteOrdinance: "",
        section: "",
        subsection: "",
      },
      financial: {
        fine: "",
        costs: "",
        jcpAtjCjeaOag: "40.25",
        totalDue: "",
      },
      offense: {
        offenseDate: "",
        offenseTime: "",
        offenseDay: "",
        labServicesRequired: false,
        offenseCode: "",
        propertyRecordNumber: "",
        systemsCode: "",
      },
      location: {
        county: "",
        countyCode: "",
        townshipBoroughCity: "",
        code: "",
        zone: "",
        initialReport: "",
        attnLce: "",
        militaryService: false,
        location: "",
        stationAddress: "",
      },
      officer: {
        signature: "",
        badgeNumber: "",
        oriNumber: "",
        phoneNumber: "",
        officerId: "",
        dateFiledOnInfoReceived: "",
      },
      victim: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        dateOfBirth: "",
        sex: "",
        race: "",
        ethnicity: "",
        address: "",
        phoneNumber: "",
      },
      additional: {
        confidentialInformation: "",
        remarksSubpoenaList: "",
      },
      metadata: {
        formVersion: "AOPC 407-95 (Rev. 11/2022)",
        copyType: "",
      },
    },
  })

  useEffect(() => {
    setIsClient(true)

    // Generate or load application ID
    const storedAppId = localStorage.getItem("currentApplicationId")
    if (storedAppId) {
      setApplicationId(storedAppId)
      // Load saved form data
      const savedData = localStorage.getItem(`application_${storedAppId}`)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          form.reset(parsedData)
          toast.info("Draft loaded successfully")
        } catch (error) {
          console.error("Error loading saved data:", error)
        }
      }
    } else {
      const newAppId = `NTC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setApplicationId(newAppId)
      localStorage.setItem("currentApplicationId", newAppId)
    }
  }, [])

  useEffect(() => {
    if (!isClient || !applicationId) return

    const subscription = form.watch((data) => {
      try {
        localStorage.setItem(`application_${applicationId}`, JSON.stringify(data))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, applicationId, isClient])

  const onSubmit = (data: FormData) => {
    if (!isClient) return

    try {
      // Save to localStorage with submitted status
      const submissionData = {
        ...data,
        applicationId,
        status: "submitted",
        submittedAt: new Date().toISOString(),
      }

      localStorage.setItem(`application_${applicationId}`, JSON.stringify(submissionData))

      // Add to list of all applications
      const allApps = JSON.parse(localStorage.getItem("allApplications") || "[]")
      allApps.push({
        id: applicationId,
        submittedAt: submissionData.submittedAt,
        status: "submitted",
        defendantName: `${data.defendant.firstName || ""} ${data.defendant.lastName || ""}`.trim() || "N/A",
      })
      localStorage.setItem("allApplications", JSON.stringify(allApps))

      // Clear current application ID
      localStorage.removeItem("currentApplicationId")

      toast.success("Application submitted successfully!", {
        description: `Application ID: ${applicationId}`,
      })

      // Redirect to track application page
      setTimeout(() => {
        router.push(`/track-application?id=${applicationId}`)
      }, 1500)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSaveDraft = () => {
    if (!isClient) return
    toast.success("Draft saved successfully!", {
      description: `Application ID: ${applicationId}`,
    })
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-300">Loading form...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Non Traffic Citation Application</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Application ID: <span className="font-mono font-semibold">{applicationId}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep > step.id
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-400 dark:bg-gray-800 dark:border-gray-600"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{STEPS[currentStep - 1].title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Citation & Court */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="citationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Citation Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter citation number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="court.magisterialDistrictCourt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Magisterial District Court</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter court name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="court.docketNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Docket Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter docket number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="court.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Court Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter court address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="court.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="court.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="PA" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="court.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Case Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="case.socialSecurityNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Security Number</FormLabel>
                          <FormControl>
                            <Input placeholder="XXX-XX-XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="case.incidentCadCaseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident/CAD Case Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter incident number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="case.caseInstitutedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Instituted By</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter institution name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Defendant Details */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Middle name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.suffix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suffix</FormLabel>
                            <FormControl>
                              <Input placeholder="Jr., Sr., III" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.driversNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver's License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="License number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.driversLicenseState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License State</FormLabel>
                            <FormControl>
                              <Input placeholder="PA" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="defendant.streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="PA" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.race"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Race</FormLabel>
                            <FormControl>
                              <Input placeholder="Race" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.ethnicity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ethnicity</FormLabel>
                            <FormControl>
                              <Input placeholder="Ethnicity" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="defendant.residentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Status</FormLabel>
                          <FormControl>
                            <Input placeholder="Resident status" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defendant.signature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Signature</FormLabel>
                            <FormControl>
                              <Input placeholder="Type name for signature" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defendant.signatureDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Signature Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Juvenile Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="juvenile.isJuvenile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Is Juvenile</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="juvenile.parentsNotified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Parents Notified</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="juvenile.parentFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Parent first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="juvenile.parentLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Parent last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="juvenile.dateNotified"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Notified</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="juvenile.timeNotified"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Notified</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Charges */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="charge.charge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charge</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter charge" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="charge.natureOfOffense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nature of Offense</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the offense" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="charge.paCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PA Code</FormLabel>
                          <FormControl>
                            <Input placeholder="PA code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="charge.statuteOrdinance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statute/Ordinance</FormLabel>
                            <FormControl>
                              <Input placeholder="Statute" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="charge.section"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section</FormLabel>
                            <FormControl>
                              <Input placeholder="Section" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="charge.subsection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subsection</FormLabel>
                            <FormControl>
                              <Input placeholder="Subsection" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 6: Financial */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="financial.fine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fine ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financial.costs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costs ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financial.jcpAtjCjeaOag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>JCP/ATJ/CJEA/OAG ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="40.25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financial.totalDue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Due ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 7: Offense Details */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="offense.offenseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Offense Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="offense.offenseTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Offense Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="offense.offenseDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <FormControl>
                              <Input placeholder="Monday" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="offense.labServicesRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Lab Services Required</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offense.offenseCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offense Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Offense code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offense.propertyRecordNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Record Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Property record number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offense.systemsCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Systems Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Systems code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 8: Location */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location.county"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>County</FormLabel>
                            <FormControl>
                              <Input placeholder="County name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location.countyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>County Code</FormLabel>
                            <FormControl>
                              <Input placeholder="County code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location.townshipBoroughCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Township/Borough/City</FormLabel>
                          <FormControl>
                            <Input placeholder="Township/Borough/City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location.code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Location code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location.zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone</FormLabel>
                            <FormControl>
                              <Input placeholder="Zone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location.initialReport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Report</FormLabel>
                          <FormControl>
                            <Input placeholder="Initial report reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.attnLce"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attn LCE</FormLabel>
                          <FormControl>
                            <Input placeholder="Attention LCE" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.militaryService"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Military Service</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Detailed location description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.stationAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Station Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Station address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 9: Officer Information */}
                {currentStep === 9 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="officer.signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Officer Signature</FormLabel>
                          <FormControl>
                            <Input placeholder="Type name for signature" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="officer.badgeNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Badge Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Badge number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="officer.oriNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ORI Number</FormLabel>
                            <FormControl>
                              <Input placeholder="ORI number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="officer.phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 555-5555" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="officer.officerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Officer ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Officer ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="officer.dateFiledOnInfoReceived"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Filed/Info Received</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 10: Victim Information */}
                {currentStep === 10 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="victim.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="victim.middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Middle name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="victim.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="victim.suffix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suffix</FormLabel>
                            <FormControl>
                              <Input placeholder="Jr., Sr., III" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="victim.dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="victim.sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="victim.race"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Race</FormLabel>
                            <FormControl>
                              <Input placeholder="Race" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="victim.ethnicity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ethnicity</FormLabel>
                            <FormControl>
                              <Input placeholder="Ethnicity" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="victim.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="victim.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 555-5555" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 11: Additional Information */}
                {currentStep === 11 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="additional.confidentialInformation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidential Information</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter confidential information"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additional.remarksSubpoenaList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks/Subpoena List</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter remarks and subpoena list"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metadata.formVersion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form Version</FormLabel>
                          <FormControl>
                            <Input placeholder="AOPC 407-95 (Rev. 11/2022)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metadata.copyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Copy Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select copy type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ORIGINAL">Original</SelectItem>
                              <SelectItem value="DEFENDANT">Defendant</SelectItem>
                              <SelectItem value="PUBLIC_ACCESS_COPY">Public Access Copy</SelectItem>
                              <SelectItem value="POLICE">Police</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button type="button" variant="outline" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
