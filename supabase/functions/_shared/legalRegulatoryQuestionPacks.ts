/**
 * Legal & Regulatory Question Packs
 * Includes generic pack + 3 detailed packs (planning-applications, building-permits, general-compliance-checks)
 */

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionDef {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'file';
  required: boolean;
  placeholder?: string;
  accept?: string;
  options?: QuestionOption[];
}

export interface MicroservicePack {
  microSlug: string;
  subcategorySlug: string;
  categorySlug: string;
  version: number;
  questions: QuestionDef[];
}

/**
 * Generic Legal & Regulatory pack
 */
const buildGenericLegalRegPack = (
  microSlug: string,
  readableName: string,
  subcategorySlug: string
): MicroservicePack => {
  const questions: QuestionDef[] = [
    {
      id: "property_type",
      question: "What type of property or project is this for?",
      type: "select",
      required: true,
      options: [
        { value: "apartment", label: "Apartment" },
        { value: "house_villa", label: "House / villa" },
        { value: "rural_plot", label: "Rural land / plot" },
        { value: "commercial", label: "Commercial building" },
        { value: "tourist_accommodation", label: "Tourist accommodation" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "location_municipality",
      question: "Which municipality or area is the property in?",
      type: "text",
      required: true,
      placeholder: "Town/municipality, island area, or closest landmark"
    },
    {
      id: "ownership_status",
      question: "What is your relationship to the property?",
      type: "select",
      required: true,
      options: [
        { value: "owner", label: "I am the owner" },
        { value: "buyer", label: "I am buying / under offer" },
        { value: "tenant", label: "I am a tenant" },
        { value: "representing_client", label: "I represent a client / company" }
      ]
    },
    {
      id: "project_stage",
      question: "At what stage is your project or issue?",
      type: "select",
      required: true,
      options: [
        { value: "early_advice", label: "Early stage – need advice before starting" },
        { value: "design_in_progress", label: "Design in progress" },
        { value: "works_underway", label: "Works already started" },
        { value: "completed_works", label: "Works already completed" },
        { value: "inspection_or_notice", label: "I have received a notice / inspection" }
      ]
    },
    {
      id: "documents_available",
      question: "Which documents do you already have (if any)?",
      type: "checkbox",
      required: false,
      options: [
        { value: "title_deeds", label: "Title deeds / escritura" },
        { value: "existing_plans", label: "Existing plans / drawings" },
        { value: "previous_licences", label: "Previous licences / permits" },
        { value: "technical_reports", label: "Technical reports or certificates" },
        { value: "none", label: "None of the above" }
      ]
    },
    {
      id: "main_goal",
      question: "What is your main goal with this service?",
      type: "select",
      required: true,
      options: [
        { value: "get_approval", label: "Obtain approval / licence / permit" },
        { value: "regularise_works", label: "Regularise / legalise existing works" },
        { value: "check_compliance", label: "Check if everything is compliant" },
        { value: "avoid_penalties", label: "Avoid fines or legal issues" },
        { value: "information_only", label: "Get clear information and options" }
      ]
    },
    {
      id: "description",
      question: `Briefly describe what you need for "${readableName}".`,
      type: "textarea",
      required: true,
      placeholder: "Explain the situation in simple terms – what has been done, what you want to do, and any deadlines."
    },
    {
      id: "deadlines",
      question: "Is there any deadline or time pressure?",
      type: "select",
      required: false,
      options: [
        { value: "inspection_date", label: "Inspection / official date already set" },
        { value: "sale_purchase", label: "Linked to a sale or purchase" },
        { value: "no_fixed_deadline", label: "No fixed deadline" },
        { value: "other", label: "Other important timing" }
      ]
    },
    {
      id: "files",
      question: "Do you have any plans, letters or documents to share?",
      type: "file",
      required: false,
      accept: "image/*,application/pdf"
    }
  ];

  return {
    microSlug,
    subcategorySlug,
    categorySlug: "legal-regulatory",
    version: 1,
    questions
  };
};

/**
 * Detailed pack: Planning applications
 */
const planningApplicationsPack: MicroservicePack = {
  microSlug: "planning-applications",
  subcategorySlug: "planning-permissions",
  categorySlug: "legal-regulatory",
  version: 1,
  questions: [
    {
      id: "planned_works_type",
      question: "What type of works are you planning or legalising?",
      type: "checkbox",
      required: true,
      options: [
        { value: "extension", label: "Extension or new built area" },
        { value: "renovation", label: "Renovation / refurbishment" },
        { value: "pool_or_terrace", label: "Pool, terrace or outdoor works" },
        { value: "change_of_use", label: "Change of use (e.g. storage to living)" },
        { value: "other", label: "Other type of works" }
      ]
    },
    {
      id: "works_status",
      question: "Have any works already started?",
      type: "radio",
      required: true,
      options: [
        { value: "not_started", label: "No – nothing has started" },
        { value: "partially_started", label: "Yes – partially started" },
        { value: "completed", label: "Yes – works already completed" }
      ]
    },
    {
      id: "have_architect",
      question: "Do you already have an architect or technical designer?",
      type: "radio",
      required: true,
      options: [
        { value: "yes_full", label: "Yes – and they are preparing the project" },
        { value: "yes_but_need_new", label: "Yes – but I am looking for someone else" },
        { value: "no_need_architect", label: "No – I need an architect as well" }
      ]
    },
    {
      id: "previous_planning",
      question: "Is there any previous planning history for this property?",
      type: "checkbox",
      required: false,
      options: [
        { value: "previous_licence", label: "Previous licence granted" },
        { value: "previous_refusal", label: "Previous application refused" },
        { value: "informal_works", label: "Works done without clear permission" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "constraints",
      question: "Do you know if the property has any special constraints?",
      type: "checkbox",
      required: false,
      options: [
        { value: "historic", label: "Historic / listed building or area" },
        { value: "coastal", label: "Coastal or rural protection zone" },
        { value: "community_rules", label: "Strong community / building rules" },
        { value: "dont_know", label: "I don't know" }
      ]
    },
    {
      id: "decision_goal",
      question: "What do you mainly need help with?",
      type: "select",
      required: true,
      options: [
        { value: "full_application", label: "Preparing and submitting a full application" },
        { value: "feasibility_only", label: "Feasibility and what is realistically possible" },
        { value: "appeal_or_refusal", label: "Responding to refusal / preparing an appeal" },
        { value: "clarify_status", label: "Clarifying the status of existing works" }
      ]
    },
    {
      id: "timeline",
      question: "When would you ideally like the planning application submitted?",
      type: "select",
      required: true,
      options: [
        { value: "within_1_month", label: "Within 1 month" },
        { value: "1_3_months", label: "Within 1–3 months" },
        { value: "3plus_months", label: "In more than 3 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Building permits
 */
const buildingPermitsPack: MicroservicePack = {
  microSlug: "building-permits",
  subcategorySlug: "building-permits-licences",
  categorySlug: "legal-regulatory",
  version: 1,
  questions: [
    {
      id: "permit_type",
      question: "What kind of building permit do you think you need?",
      type: "select",
      required: true,
      options: [
        { value: "minor_works", label: "Minor works (small repairs, finishes, etc.)" },
        { value: "major_works", label: "Major works (extensions, structural changes)" },
        { value: "retrospective", label: "Retrospective permit for works already done" },
        { value: "not_sure", label: "Not sure – need guidance" }
      ]
    },
    {
      id: "works_description",
      question: "In simple words, what works are involved?",
      type: "textarea",
      required: true,
      placeholder: "E.g. new terrace, interior layout changes, new pool, roof works..."
    },
    {
      id: "works_started",
      question: "Have works already started on site?",
      type: "radio",
      required: true,
      options: [
        { value: "no", label: "No – nothing started yet" },
        { value: "yes_started", label: "Yes – started" },
        { value: "yes_completed", label: "Yes – already completed" }
      ]
    },
    {
      id: "have_technical_project",
      question: "Do you have a technical project or detailed plans?",
      type: "radio",
      required: true,
      options: [
        { value: "yes_full", label: "Yes – full technical project" },
        { value: "yes_basic", label: "Yes – basic drawings only" },
        { value: "no_need", label: "No – I need this too" }
      ]
    },
    {
      id: "municipality_contact",
      question: "Have you already spoken with the local council/municipality?",
      type: "select",
      required: false,
      options: [
        { value: "no", label: "No, not yet" },
        { value: "informal_chat", label: "Yes – informal chat only" },
        { value: "formal_request", label: "Yes – formal request or submission" },
        { value: "received_notice", label: "I have received a letter or notice" }
      ]
    },
    {
      id: "urgency",
      question: "Is there any urgency related to inspections, fines or deadlines?",
      type: "select",
      required: false,
      options: [
        { value: "inspection_scheduled", label: "Inspection already scheduled" },
        { value: "warning_received", label: "I have received a warning or fine" },
        { value: "sale_purchase_timing", label: "Related to sale/purchase timing" },
        { value: "no_urgent_deadline", label: "No urgent deadline" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like help with the permit process to begin?",
      type: "select",
      required: true,
      options: [
        { value: "immediately", label: "Immediately" },
        { value: "within_1_month", label: "Within 1 month" },
        { value: "1_3_months", label: "Within 1–3 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: General compliance checks
 */
const generalCompliancePack: MicroservicePack = {
  microSlug: "general-compliance-checks",
  subcategorySlug: "technical-safety-compliance",
  categorySlug: "legal-regulatory",
  version: 1,
  questions: [
    {
      id: "compliance_area",
      question: "What area of compliance are you most concerned about?",
      type: "select",
      required: true,
      options: [
        { value: "building_regulations", label: "Building regulations / building code" },
        { value: "fire_safety", label: "Fire safety" },
        { value: "accessibility", label: "Accessibility / mobility" },
        { value: "tourism_or_rentals", label: "Tourism / rentals compliance" },
        { value: "other", label: "Other / not sure" }
      ]
    },
    {
      id: "trigger_reason",
      question: "What has triggered this compliance check?",
      type: "select",
      required: true,
      options: [
        { value: "sale_or_purchase", label: "Sale or purchase of the property" },
        { value: "licence_application", label: "Applying for a licence or permit" },
        { value: "neighbour_or_community", label: "Neighbour or community issues" },
        { value: "official_notice", label: "Official notice / inspection" },
        { value: "internal_audit", label: "Internal check for peace of mind" }
      ]
    },
    {
      id: "known_issues",
      question: "Are there any known issues already?",
      type: "checkbox",
      required: false,
      options: [
        { value: "unregistered_works", label: "Works not reflected in documents" },
        { value: "changed_layout", label: "Layout changed from original plans" },
        { value: "capacity_or_occupancy", label: "Issues with capacity/occupancy limits" },
        { value: "fire_paths", label: "Escape routes or fire equipment doubts" },
        { value: "none_known", label: "No known issues, just checking" }
      ]
    },
    {
      id: "documentation",
      question: "What documentation do you have available for review?",
      type: "checkbox",
      required: false,
      options: [
        { value: "plans", label: "Architectural plans" },
        { value: "licences", label: "Licences / permits" },
        { value: "certificates", label: "Certificates (electrical, gas, etc.)" },
        { value: "no_docs", label: "Very limited or no documentation" }
      ]
    },
    {
      id: "inspection_expectation",
      question: "What are you expecting from the professional?",
      type: "select",
      required: true,
      options: [
        { value: "site_visit_report", label: "Site visit and written report" },
        { value: "brief_review", label: "Brief review and verbal guidance" },
        { value: "full_support", label: "Full support to correct any issues" },
        { value: "not_sure", label: "Not sure – need advice" }
      ]
    },
    {
      id: "timeline",
      question: "When do you need the compliance check done?",
      type: "select",
      required: true,
      options: [
        { value: "within_2_weeks", label: "Within 2 weeks" },
        { value: "within_month", label: "Within 1 month" },
        { value: "1_3_months", label: "Within 1–3 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Remaining Legal & Regulatory micro-services → generic pack
 */
const genericLegalRegServices: {
  microSlug: string;
  name: string;
  subcategorySlug: string;
}[] = [
  // Planning and Permissions
  { microSlug: "pre-application-feasibility", name: "Pre-application advice and feasibility", subcategorySlug: "planning-permissions" },
  { microSlug: "change-of-use-applications", name: "Change of use applications", subcategorySlug: "planning-permissions" },
  { microSlug: "appeals-refusals-support", name: "Appeals and refusals support", subcategorySlug: "planning-permissions" },

  // Building Permits and Licences
  { microSlug: "minor-works-permits", name: "Minor works and small works permits", subcategorySlug: "building-permits-licences" },
  { microSlug: "retrospective-permits", name: "Retrospective permits", subcategorySlug: "building-permits-licences" },
  { microSlug: "occupancy-completion-certificates", name: "Occupancy and completion certificates", subcategorySlug: "building-permits-licences" },

  // Technical and Safety Compliance
  { microSlug: "fire-safety-compliance", name: "Fire safety compliance", subcategorySlug: "technical-safety-compliance" },
  { microSlug: "accessibility-regulations", name: "Accessibility and regulations", subcategorySlug: "technical-safety-compliance" },
  { microSlug: "health-safety-inspections", name: "Health and safety inspections", subcategorySlug: "technical-safety-compliance" },

  // Commercial, Licences and Operating
  { microSlug: "business-operating-licences", name: "Business and operating licences", subcategorySlug: "commercial-licences-operating" },
  { microSlug: "restaurant-bar-licences", name: "Restaurant and bar licences", subcategorySlug: "commercial-licences-operating" },
  { microSlug: "tourist-accommodation-licences", name: "Tourist rental and accommodation licences", subcategorySlug: "commercial-licences-operating" },
  { microSlug: "noise-music-regulations", name: "Noise and music regulations", subcategorySlug: "commercial-licences-operating" },

  // Reports, Surveys and Legal Support
  { microSlug: "technical-reports-certificates", name: "Technical reports and certificates", subcategorySlug: "reports-surveys-legal-support" },
  { microSlug: "legalisation-existing-works", name: "Legalisation of existing works", subcategorySlug: "reports-surveys-legal-support" },
  { microSlug: "due-diligence-purchase-lease", name: "Due diligence for purchase or lease", subcategorySlug: "reports-surveys-legal-support" },
  { microSlug: "neighbour-community-agreements", name: "Neighbour and community agreements", subcategorySlug: "reports-surveys-legal-support" }
];

const genericLegalRegPacks: MicroservicePack[] = genericLegalRegServices.map(s =>
  buildGenericLegalRegPack(s.microSlug, s.name, s.subcategorySlug)
);

export const legalRegulatoryQuestionPacks: MicroservicePack[] = [
  planningApplicationsPack,
  buildingPermitsPack,
  generalCompliancePack,
  ...genericLegalRegPacks
];
