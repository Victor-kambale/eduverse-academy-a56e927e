import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Building2, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankAccountFormProps {
  formData: {
    bankCountry: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    iban: string;
    hasExternalCardLink: boolean;
  };
  updateFormData: (field: string, value: any) => void;
  countries: string[];
}

// Mock bank data by country
const banksByCountry: Record<string, string[]> = {
  "United States": ["Bank of America", "Chase", "Wells Fargo", "Citibank", "US Bank", "Capital One"],
  "United Kingdom": ["HSBC", "Barclays", "Lloyds", "NatWest", "Santander UK", "Standard Chartered"],
  "Canada": ["RBC", "TD Bank", "Scotiabank", "BMO", "CIBC"],
  "Australia": ["Commonwealth Bank", "Westpac", "NAB", "ANZ", "Macquarie"],
  "Germany": ["Deutsche Bank", "Commerzbank", "DZ Bank", "KfW", "Sparkasse"],
  "France": ["BNP Paribas", "Crédit Agricole", "Société Générale", "BPCE"],
  "Rwanda": ["Bank of Kigali", "I&M Bank", "Equity Bank", "Access Bank", "Cogebanque"],
  "Nigeria": ["First Bank", "GTBank", "Access Bank", "Zenith Bank", "UBA"],
  "Kenya": ["Equity Bank", "KCB Bank", "Co-operative Bank", "Standard Chartered"],
};

export const BankAccountForm = ({ formData, updateFormData, countries }: BankAccountFormProps) => {
  const availableBanks = formData.bankCountry ? banksByCountry[formData.bankCountry] || [] : [];
  const showBankNotFound = formData.bankCountry && availableBanks.length === 0;

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Payment Information</p>
            <p className="text-muted-foreground">
              Your bank account will be used to receive earnings from your courses. 
              All information is encrypted and stored securely following PCI DSS standards.
            </p>
          </div>
        </div>
      </div>

      {/* External Card Option */}
      <Card className="border-accent/50 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="externalCard"
              checked={formData.hasExternalCardLink}
              onCheckedChange={(checked) => updateFormData('hasExternalCardLink', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="externalCard" className="font-medium cursor-pointer flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                I don't have a bank account
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Create a Business Premium Visa card through our partner to receive your earnings.
              </p>
              {formData.hasExternalCardLink && (
                <Button variant="link" className="p-0 h-auto mt-2 text-accent" asChild>
                  <a href="https://example.com/create-card" target="_blank" rel="noopener noreferrer">
                    Create your Business Card <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!formData.hasExternalCardLink && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankCountry">Country of Birth / Bank Country *</Label>
              <Select 
                value={formData.bankCountry} 
                onValueChange={(v) => {
                  updateFormData('bankCountry', v);
                  updateFormData('bankName', ''); // Reset bank when country changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              {availableBanks.length > 0 ? (
                <Select value={formData.bankName} onValueChange={(v) => updateFormData('bankName', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                    <SelectItem value="other">Other (not listed)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
              )}
            </div>
          </div>

          {showBankNotFound && (
            <Card className="border-warning/50 bg-warning/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Banks not found for this country</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please consider creating a Business Premium Visa card through our partner above, 
                      or enter your bank name manually.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name *</Label>
            <Input
              id="accountHolder"
              value={formData.accountHolderName}
              onChange={(e) => updateFormData('accountHolderName', e.target.value)}
              placeholder="Full name as it appears on the account"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber}
                onChange={(e) => updateFormData('routingNumber', e.target.value)}
                placeholder="For US banks"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
              <Input
                id="swiftCode"
                value={formData.swiftCode}
                onChange={(e) => updateFormData('swiftCode', e.target.value)}
                placeholder="International transfers"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => updateFormData('iban', e.target.value)}
                placeholder="International bank account number"
              />
            </div>
          </div>
        </>
      )}

      <div className="bg-muted rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            You can update your bank details later from your profile settings.
          </span>
        </div>
      </div>
    </div>
  );
};
