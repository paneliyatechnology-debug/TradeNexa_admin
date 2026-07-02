export interface BackendAuthRole {
  code: string;
  name: string;
}

export interface BackendAuthUser {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  mobile_number: string | null;
  role_id: number;
  role: BackendAuthRole;
  is_verified: boolean;
  is_active: boolean;
  is_completed_profile: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendLoginData {
  user: BackendAuthUser;
  access_token: string;
  refresh_token: string;
}

export interface BackendRefreshTokenData {
  access_token: string;
  refresh_token: string;
}

export interface BackendProfileAddress {
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
}

export interface BackendProfileBusinessType {
  id: number;
  name: string;
  code: string;
}

export interface BackendProfile {
  uuid: string;
  full_name: string;
  mobile_number: string | null;
  email: string;
  role_id: number;
  role: string;
  business_type_id: number | null;
  business_type: BackendProfileBusinessType | null;
  language_id: number | null;
  language: string | null;
  is_verified: number | boolean;
  is_active: number | boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  profile_image: string | null;
  company_name: string | null;
  industry: string | null;
  gst_number: string | null;
  address: BackendProfileAddress | null;
  company_logo: string | null;
  company_banner: string | null;
  pan_number: string | null;
  cin: string | null;
  iec: string | null;
  business_description: string | null;
}
