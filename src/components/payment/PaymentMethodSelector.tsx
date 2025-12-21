import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  Globe
} from "lucide-react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
  popular?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Credit/Debit Card",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Visa, Mastercard, Amex",
    available: true,
    popular: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: <Wallet className="w-6 h-6" />,
    description: "Pay with your PayPal account",
    available: true,
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: <Smartphone className="w-6 h-6" />,
    description: "Fast checkout with Google",
    available: true,
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: <Smartphone className="w-6 h-6" />,
    description: "Pay with Touch ID or Face ID",
    available: true,
  },
  {
    id: "wechat",
    name: "WeChat Pay",
    icon: <Globe className="w-6 h-6" />,
    description: "微信支付",
    available: true,
  },
  {
    id: "alipay",
    name: "Alipay",
    icon: <Globe className="w-6 h-6" />,
    description: "支付宝",
    available: true,
  },
  {
    id: "visa",
    name: "Visa Direct",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Direct Visa payment",
    available: true,
  },
  {
    id: "amex",
    name: "American Express",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Amex card payment",
    available: true,
  },
  {
    id: "payoneer",
    name: "Payoneer",
    icon: <Wallet className="w-6 h-6" />,
    description: "Global payment platform",
    available: true,
  },
  {
    id: "mobile",
    name: "Mobile Money",
    icon: <Smartphone className="w-6 h-6" />,
    description: "Pay via mobile number",
    available: true,
  },
];

export const PaymentMethodSelector = ({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {paymentMethods.map((method) => (
        <Card
          key={method.id}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:border-accent",
            selectedMethod === method.id
              ? "border-accent ring-2 ring-accent/20 bg-accent/5"
              : "border-border",
            !method.available && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => method.available && onSelect(method.id)}
        >
          <CardContent className="p-3 flex flex-col items-center text-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                selectedMethod === method.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted"
              )}
            >
              {method.icon}
            </div>
            <div>
              <p className="font-medium text-sm leading-tight">{method.name}</p>
              {method.popular && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Popular
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
