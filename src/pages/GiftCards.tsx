import { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Users, 
  GraduationCap, 
  Globe,
  Star,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Minus,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Layout } from '@/components/layout/Layout';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';
import { toast } from 'sonner';

interface GiftCardDesign {
  id: string;
  name: string;
  gradient: string;
  icon?: string;
  category: 'holiday' | 'celebration' | 'special' | 'custom';
}

const giftCardDesigns: GiftCardDesign[] = [
  { id: 'christmas', name: 'Christmas Gift Card', gradient: 'from-red-500 to-red-700', category: 'holiday' },
  { id: 'hanukkah', name: 'Hanukkah Gift Card', gradient: 'from-blue-800 to-blue-950', category: 'holiday' },
  { id: 'holidays', name: 'Happy Holidays Gift Card', gradient: 'from-green-600 to-green-800', category: 'holiday' },
  { id: 'custom', name: 'Create Your Own Gift Card', gradient: 'from-lime-400 to-green-500', category: 'custom' },
  { id: 'dreams', name: 'Achieve Your Dreams Gift Card', gradient: 'from-yellow-200 to-amber-300', category: 'special' },
  { id: 'birthday', name: 'Birthday Gift Card', gradient: 'from-orange-300 to-pink-400', category: 'celebration' },
  { id: 'congratulations', name: 'Congratulations Gift Card', gradient: 'from-purple-200 to-purple-400', category: 'celebration' },
  { id: 'diwali', name: 'Diwali Gift Card', gradient: 'from-purple-600 to-purple-900', category: 'holiday' },
  { id: 'eid', name: 'Eid Gift Card', gradient: 'from-blue-400 to-blue-600', category: 'holiday' },
  { id: 'farewell', name: 'Farewell Gift Card', gradient: 'from-indigo-800 to-pink-600', category: 'special' },
  { id: 'fathers-day', name: "Father's Day Gift Card", gradient: 'from-sky-300 to-sky-500', category: 'celebration' },
  { id: 'special', name: 'For Someone Special Gift Card', gradient: 'from-pink-200 to-pink-400', category: 'special' },
  { id: 'graduation', name: 'Happy Graduation Gift Card', gradient: 'from-blue-300 to-sky-400', category: 'celebration' },
  { id: 'just-for-you', name: 'Just For You Gift Card', gradient: 'from-amber-100 to-pink-200', category: 'special' },
  { id: 'mothers-day', name: "Mother's Day Gift Card", gradient: 'from-teal-300 to-teal-500', category: 'celebration' },
  { id: 'thank-you', name: 'Thank You Gift Card', gradient: 'from-slate-800 to-slate-900', category: 'special' },
  { id: 'thanksgiving', name: 'Thanksgiving Gift Card', gradient: 'from-orange-600 to-amber-700', category: 'holiday' },
  { id: 'thinking', name: 'Thinking of You Gift Card', gradient: 'from-rose-300 to-rose-500', category: 'special' },
  { id: 'valentines', name: "Valentine's Day Gift Card", gradient: 'from-pink-400 to-red-500', category: 'holiday' },
  { id: 'womens-day', name: "Women's Day Gift Card", gradient: 'from-pink-200 to-pink-400', category: 'celebration' },
];

const testimonials = [
  {
    name: 'Ayesha J.',
    role: 'Eduverse Graduate',
    country: '🇵🇰',
    rating: 5,
    text: 'Each course on Eduverse has contributed to enhancing my career confidence and professional toolkit. The certifications I\'ve earned not only validate my skills but also catch the attention of employers.',
  },
  {
    name: 'Allan K.',
    role: 'Eduverse Graduate',
    country: '🇺🇬',
    rating: 5,
    text: 'Eduverse has truly changed my life! Through the platform, I completed a Diploma in Supervision and a Diploma in Logistics, which provided me with a solid platform for self-education and professional development.',
  },
  {
    name: 'Gilbert N.',
    role: 'Eduverse Graduate',
    country: '🇰🇪',
    rating: 5,
    text: 'The flexibility of online learning allowed me to study at my own pace, and the valuable skills I gained helped me transition from bartending to a management role.',
  },
];

export default function GiftCards() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'howto'>('purchase');
  const [selectedCard, setSelectedCard] = useState<GiftCardDesign | null>(null);
  const [step, setStep] = useState(1);
  const [diplomaCount, setDiplomaCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customImage, setCustomImage] = useState<number>(0);
  const [customHeadline, setCustomHeadline] = useState('');

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const DIPLOMA_PRICE = 36.80;
  const CERTIFICATE_PRICE = 12.00;

  const totalAmount = (diplomaCount * DIPLOMA_PRICE) + (certificateCount * CERTIFICATE_PRICE);

  const customImages = [
    'from-cyan-400 to-blue-500',
    'from-pink-400 to-purple-500',
    'from-yellow-400 to-orange-500',
    'from-green-400 to-teal-500',
    'from-red-400 to-pink-500',
    'from-indigo-400 to-purple-600',
  ];

  const handleSelectCard = (card: GiftCardDesign) => {
    if (card.category === 'custom') {
      setShowCustomModal(true);
    } else {
      setSelectedCard(card);
      setStep(2);
    }
  };

  const handleCustomCardCreate = () => {
    const customCard: GiftCardDesign = {
      id: 'custom-created',
      name: customHeadline || 'Custom Gift Card',
      gradient: customImages[customImage],
      category: 'custom',
    };
    setSelectedCard(customCard);
    setShowCustomModal(false);
    setStep(2);
  };

  const handleProceedToPayment = () => {
    if (!recipientName || !recipientEmail || !senderName) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (totalAmount === 0) {
      toast.error('Please select at least one certificate type');
      return;
    }
    setStep(3);
    toast.success('Proceeding to payment...');
  };

  const resetForm = () => {
    setSelectedCard(null);
    setStep(1);
    setDiplomaCount(0);
    setCertificateCount(0);
    setRecipientName('');
    setRecipientEmail('');
    setSenderName('');
    setMessage('');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-background dark:via-background dark:to-background">
        {/* Hero Section */}
        <div className="relative py-16 px-4 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-primary/5 dark:to-accent/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-green-600 font-semibold mb-2">Knowledge Lasts a Lifetime</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Inspire others to learn with Eduverse Gift Cards
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Purchase a digital Certificate or Diploma for your friends and family so when they 
                  finish any of Eduverse's 6,000+ courses, their certificate will be free for them. 
                  Perfect for any occasion, you can inspire others to pursue their passions.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <strong>50M+</strong> Learners
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <strong>15M+</strong> Graduates
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <strong>193</strong> Countries
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-xl flex items-center justify-center">
                    <Gift className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-20 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg" />
                  <div className="absolute -bottom-4 -left-4 w-24 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-primary text-primary-foreground py-4">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-sm">
            <span className="flex items-center gap-2">
              <div className="flex text-green-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              Rated <strong>Excellent</strong> on Trustpilot
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <strong>50 Million+</strong> Learners
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <strong>15 Million+</strong> Graduates
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <strong>193</strong> Countries
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'purchase' | 'howto')}>
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="purchase" className="text-lg">Purchase Gift Card</TabsTrigger>
              <TabsTrigger value="howto" className="text-lg">How To Use</TabsTrigger>
            </TabsList>

            <TabsContent value="purchase" className="mt-8">
              {step === 1 && (
                <div className="space-y-6">
                  {/* Gift Card Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {giftCardDesigns.map((card) => (
                      <Card 
                        key={card.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 overflow-hidden"
                        onClick={() => handleSelectCard(card)}
                      >
                        <div className={`aspect-[4/3] bg-gradient-to-br ${card.gradient} flex items-center justify-center p-4`}>
                          {card.category === 'custom' ? (
                            <div className="text-center text-white">
                              <Sparkles className="h-10 w-10 mx-auto mb-2" />
                              <span className="text-sm font-medium">Create Your Own</span>
                            </div>
                          ) : (
                            <Gift className="h-10 w-10 text-white/80" />
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">{card.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && selectedCard && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Form Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Progress Steps */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                        <span>Choose Gift Card</span>
                        <span className="text-muted-foreground">({selectedCard.name})</span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          2
                        </div>
                        <span>Enter Details</span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          3
                        </div>
                        <span>Payment</span>
                      </div>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Enter Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Certificate Type */}
                        <div>
                          <Label className="flex items-center gap-1">
                            Certificate Type
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </Label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Eduverse offers 2 course types. Select the type of Certificate you'd like to gift.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">Digital Diploma</h4>
                                  <p className="text-lg font-bold text-primary">${DIPLOMA_PRICE.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setDiplomaCount(Math.max(0, diplomaCount - 1))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold">{diplomaCount}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setDiplomaCount(diplomaCount + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">Digital Certificate</h4>
                                  <p className="text-lg font-bold text-primary">${CERTIFICATE_PRICE.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setCertificateCount(Math.max(0, certificateCount - 1))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold">{certificateCount}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setCertificateCount(certificateCount + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <div className="space-y-4">
                          <Label>Recipient's Details</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input 
                              placeholder="Recipient's Name"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                            />
                            <div>
                              <Input 
                                type="email"
                                placeholder="Recipient's Email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                              />
                              {!recipientEmail && (
                                <p className="text-xs text-red-500 mt-1">Recipient's Email is required</p>
                              )}
                            </div>
                          </div>
                          <Textarea 
                            placeholder="Add a personal message (optional)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={100}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {100 - message.length} characters remaining
                          </p>
                        </div>

                        {/* Your Details */}
                        <div className="space-y-4">
                          <Label>Your Details</Label>
                          <Input 
                            placeholder="Your Name"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                          />
                        </div>

                        {/* Delivery Date */}
                        <div className="space-y-4">
                          <Label>When do you want the gift card to be delivered?</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input 
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Input 
                              type="time"
                              value={deliveryTime}
                              onChange={(e) => setDeliveryTime(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button variant="outline" onClick={resetForm}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button onClick={handleProceedToPayment} disabled={totalAmount === 0}>
                            Proceed to Payment
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground">GIFT CARD PREVIEW</h3>
                    <Card className="overflow-hidden">
                      <div className={`aspect-[4/3] bg-gradient-to-br ${selectedCard.gradient} flex items-center justify-center p-6`}>
                        <Gift className="h-16 w-16 text-white/80" />
                      </div>
                      <CardContent className="p-4">
                        <p className="font-medium">Hi {recipientName || 'Recipient'},</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          You have received a gift card from
                        </p>
                        <p className="font-semibold text-lg">{senderName || 'Sender'}</p>
                        {message && (
                          <p className="text-sm mt-2 italic text-muted-foreground">"{message}"</p>
                        )}
                      </CardContent>
                      <div className="border-t p-4 flex items-center justify-between bg-muted/50">
                        <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
                        <Button size="sm" disabled={totalAmount === 0}>
                          Proceed to Gift
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="howto" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="what">
                      <AccordionTrigger>What is an Eduverse Gift Card?</AccordionTrigger>
                      <AccordionContent>
                        Whether you're looking to gift a loved one the opportunity to advance their career 
                        or encourage them to explore a new hobby, an Eduverse Gift Card is the perfect choice. 
                        You can purchase a digital certificate or diploma for a family member or friend. 
                        An ideal gift for students, professionals, and lifelong learners.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="purchase">
                      <AccordionTrigger>How can I purchase an Eduverse Gift Card?</AccordionTrigger>
                      <AccordionContent>
                        Simply choose the Gift Card design, enter your details and proceed to checkout.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="receive">
                      <AccordionTrigger>How will the recipient receive the Eduverse Gift Card?</AccordionTrigger>
                      <AccordionContent>
                        The Eduverse Gift Card will be sent to the recipient via email, instantly or on a 
                        scheduled date of your choosing.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="use">
                      <AccordionTrigger>What can my Eduverse gift card be used for if the courses are free?</AccordionTrigger>
                      <AccordionContent>
                        While Eduverse courses are free to take, the gift card covers the cost of the official 
                        certificate or diploma upon completion. This allows the recipient to earn a verified 
                        credential without any cost to them.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="any-course">
                      <AccordionTrigger>Can the recipient use the Gift Card for any Eduverse course?</AccordionTrigger>
                      <AccordionContent>
                        Yes! The recipient can choose from over 6,000 courses across various subjects and 
                        categories. The gift card value can be applied to any certificate or diploma.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="redeem">
                      <AccordionTrigger>How can I redeem an Eduverse Gift Card?</AccordionTrigger>
                      <AccordionContent>
                        When you receive a gift card, simply click the redemption link in your email. 
                        Create or log into your Eduverse account, and the gift card balance will be 
                        automatically applied to your account.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="expiry">
                      <AccordionTrigger>Is there an expiration date for Eduverse Gift Cards?</AccordionTrigger>
                      <AccordionContent>
                        Eduverse Gift Cards are valid for 2 years from the date of purchase.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="refund">
                      <AccordionTrigger>Can I get a refund on an Eduverse Gift Card?</AccordionTrigger>
                      <AccordionContent>
                        Gift cards are non-refundable once purchased. Please ensure all recipient details 
                        are correct before completing your purchase.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Benefits Section */}
          <div className="mt-16 py-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 -mx-4 px-4 rounded-xl">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Benefits of Eduverse Gift Cards</h2>
                <Button variant="link" className="text-primary">T&Cs</Button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">Spark New Learning Opportunities</h3>
                  <p className="text-muted-foreground">
                    Unlock endless possibilities for your loved ones with access to thousands of courses 
                    across diverse subjects, ensuring everyone finds their perfect fit.
                  </p>
                  <p className="text-primary font-medium">
                    24% of learners transitioned to a new career and got a job interview
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Inspire Career Growth</h3>
                  <p className="text-muted-foreground">
                    Empower recipients with the freedom to learn at their own pace, seamlessly 
                    integrating education into their busy lives.
                  </p>
                  <p className="text-primary font-medium">
                    19% of learners decided on a career path and started their own business
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold">Invest In Their Future</h3>
                  <p className="text-muted-foreground">
                    Help your loved ones reach their goals and enhance their careers without financial barriers.
                  </p>
                  <p className="text-primary font-medium">
                    33% of learners improved their skills and received a promotion
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Eduverse's Graduates Have to Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-6">
                    <div className="absolute top-4 right-4 text-4xl text-muted-foreground/20">"</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-lg font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} {testimonial.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Craft Custom Card CTA */}
          <div className="mt-16 py-12 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 -mx-4 px-4 rounded-xl">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Craft a Unique Gift Card</h2>
                <p className="text-muted-foreground mb-6">
                  Create a custom gift card that reflects your loved one's journey. Tailor the design 
                  and add your own message, empowering them to finish any Eduverse course and receive 
                  their certificate with your personalised gift.
                </p>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowCustomModal(true)}
                >
                  Create Your Own Gift Card
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl shadow-xl" />
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full" />
                  <div className="absolute bottom-4 right-4 w-12 h-4 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Gift Card Modal */}
        <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Make Your Own Gift Card</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Choose a visual</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {customImages.map((gradient, index) => (
                      <div
                        key={index}
                        className={`aspect-video rounded-lg cursor-pointer transition-all bg-gradient-to-br ${gradient} ${
                          customImage === index ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'
                        }`}
                        onClick={() => setCustomImage(index)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Input
                    placeholder="Type a short headline to appear on the card..."
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value.slice(0, 40))}
                    maxLength={40}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {40 - customHeadline.length} characters remaining
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Preview</Label>
                <Card className="overflow-hidden mt-2">
                  <div className={`aspect-video bg-gradient-to-br ${customImages[customImage]} flex items-center justify-center p-4`}>
                    {customHeadline ? (
                      <span className="text-white text-xl font-bold text-center">{customHeadline}</span>
                    ) : (
                      <Gift className="h-12 w-12 text-white/80" />
                    )}
                  </div>
                </Card>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowCustomModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomCardCreate}>
                Next
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
