import { UTMParams } from './utils/utm';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export type DeviceOption = 'Smartphone' | 'Laptop' | 'Both';

export type CanvaExperienceOption =
  | 'Complete beginner'
  | "I've used Canva before"
  | 'Intermediate';

export type LearningGoalOption =
  | 'Flyer Design'
  | 'Logo Design'
  | 'Business Card Design'
  | 'Social Media Design'
  | 'Everything';

export interface RegistrationFormData {
  id?: string | number;
  ticketNumber?: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  formattedWhatsapp?: string;
  device: DeviceOption;
  canvaExperience: CanvaExperienceOption;
  learningGoal: LearningGoalOption;
  consent: boolean;
  registeredAt?: string;
  utmParams?: UTMParams;
  classBatch?: string;
}

export type ParticipantStatus =
  | 'REGISTERED'
  | 'WHATSAPP JOINED'
  | 'DAY 1 ATTENDED'
  | 'DAY 2 ATTENDED'
  | 'DAY 3 ATTENDED'
  | 'MASTER CLASS INTERESTED'
  | 'PAYMENT PENDING'
  | 'PART PAYMENT'
  | 'FULL PAYMENT'
  | 'PAID STUDENT'
  | 'ABSENT';

export interface AdminParticipant {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  device: DeviceOption;
  canva_experience: 'Beginner' | 'Used Canva Before' | 'Intermediate';
  learning_interest: string;
  registration_date: string;
  registration_time: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  status: ParticipantStatus;
  whatsapp_joined: boolean;
  attendance_day_1: boolean;
  attendance_day_2: boolean;
  attendance_day_3: boolean;
  masterclass_interest: boolean;
  email_status: 'none' | 'pending' | 'sent' | 'failed';
  last_email_sent?: string;
  email_error?: string;
  email_attempts?: number;
  retry_count?: number;
  admin_notes: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export interface AdminAccountInfo {
  email: string;
  name: string;
  role: string;
  lastLogin?: string;
  updatedAt?: string;
  recoveryEmail: string;
  isRecoveryConfigured: boolean;
}

export interface VisitorSession {
  id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  device?: string;
  browser?: string;
  current_page: string;
  first_seen: string;
  last_heartbeat: string;
  active_seconds: number;
  is_active: boolean;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED';
}

export interface LiveVisitorMetrics {
  activeVisitorsNow: number;
  visitorsPastHour: number;
  todaySessionsCount: number;
  todayRegistrations: number;
  activeSessions: VisitorSession[];
  recentEvents: Array<{
    id: string;
    event: string;
    timestamp: string;
    source?: string;
    details?: string;
  }>;
  serverLagosTime?: string;
}

export interface FunnelStep {
  step: number;
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

export interface CRMStats {
  total: number;
  today: number;
  thisWeek: number;
  whatsappJoined: number;
  classAttended: number;
  masterClassInterested: number;
  totalVisitors?: number;
  registrationStarted?: number;
  totalRegistered?: number;
  todayRegistrations?: number;
  whatsappClicks?: number;
  emailsSent?: number;
  emailsFailed?: number;
  registrationConversionRate?: number;
  funnel?: FunnelStep[];
  sourceCounts: Record<string, number>;
  deviceCounts: Record<string, number>;
  experienceCounts: Record<string, number>;
  skillCounts: Record<string, number>;
  dayCounts: Record<string, number>;
  lagosServerTime?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  admin_email: string;
  ip_address: string;
  timestamp: string;
}

export interface ClassSettings {
  class_name: string;
  class_date: string;
  class_time: string;
  class_link: string;
  whatsapp_group_link: string;
  registration_status: 'OPEN' | 'CLOSED';
  automation_enabled: boolean;
  automation_template_id: string;
  founder_image_url?: string;
  countdown_target_date?: string;
  updated_at?: string;
}

export interface PublicClassSettings {
  className: string;
  classDate: string;
  classTime: string;
  classLink: string;
  whatsappGroupLink: string;
  registrationStatus: 'OPEN' | 'CLOSED';
  automationEnabled: boolean;
  founderImageUrl?: string;
  countdownTargetDate?: string;
}

export interface LearningItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag: string;
  bulletPoints: string[];
}

export interface DayCurriculum {
  dayNumber: number;
  title: string;
  subtitle: string;
  humanDescription: string;
  topics: string[];
  practicalOutcome: string;
}

export interface AudienceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
}

export interface MentorSocialLink {
  label: string;
  url: string;
  iconName: string;
}
