-- Create withdrawals table for tracking all withdrawal/transfer requests
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'teacher', 'university')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL CHECK (category IN ('course_sales', 'appointments', 'course_creation_fees', 'maintenance', 'other')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal', 'bank_transfer', 'stripe', 'google_pay', 'apple_pay', 'wechat', 'alipay', 'payoneer', 'mobile_money')),
  payment_details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verification_required', 'processing', 'completed', 'rejected', 'failed')),
  
  -- Verification fields
  id_document_url TEXT,
  signature_url TEXT,
  contract_url TEXT,
  phone_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_attempts INTEGER DEFAULT 0,
  
  -- Processing fields
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  transaction_id TEXT,
  
  -- Receipt
  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linked accounts table for saved payment methods
CREATE TABLE public.linked_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('paypal', 'bank', 'stripe', 'google_pay', 'apple_pay', 'wechat', 'alipay', 'payoneer', 'mobile')),
  account_name TEXT NOT NULL,
  account_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create earnings summary table for tracking balances
CREATE TABLE public.earnings_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_course_sales NUMERIC DEFAULT 0,
  total_appointments NUMERIC DEFAULT 0,
  total_course_fees NUMERIC DEFAULT 0,
  total_other NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  available_balance NUMERIC GENERATED ALWAYS AS (
    total_course_sales + total_appointments + total_course_fees + total_other - total_withdrawn
  ) STORED,
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending withdrawals"
ON public.withdrawals FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any withdrawal"
ON public.withdrawals FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for linked_accounts
CREATE POLICY "Users can manage their linked accounts"
ON public.linked_accounts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all linked accounts"
ON public.linked_accounts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for earnings_summary
CREATE POLICY "Users can view their earnings"
ON public.earnings_summary FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage earnings"
ON public.earnings_summary FOR ALL
USING (true)
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linked_accounts_updated_at
BEFORE UPDATE ON public.linked_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_earnings_summary_updated_at
BEFORE UPDATE ON public.earnings_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number := 'EDV-WD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_withdrawal_receipt
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.generate_receipt_number();