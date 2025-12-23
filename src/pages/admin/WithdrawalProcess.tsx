import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, GraduationCap, Shield, Users } from 'lucide-react';
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm';

export default function WithdrawalProcess() {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Process</h1>
          <p className="text-muted-foreground">
            Complete withdrawal flows for Admin, Teachers, and Universities
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Secure Environment
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Withdrawal
          </TabsTrigger>
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Teacher Withdrawal
          </TabsTrigger>
          <TabsTrigger value="university" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            University Withdrawal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Admin Withdrawal
              </CardTitle>
              <CardDescription>
                Process admin platform revenue withdrawals with simplified verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawalForm userType="admin" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teacher Withdrawal
              </CardTitle>
              <CardDescription>
                Teachers can withdraw their course earnings with full verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawalForm userType="teacher" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="university">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                University Withdrawal
              </CardTitle>
              <CardDescription>
                Universities can withdraw their partnership earnings with institution verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawalForm userType="university" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Process Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Admin Process
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
                  <span>Select earnings category and amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
                  <span>Choose payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
                  <span>Enter payment details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span>
                  <span>SMS verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">5</span>
                  <span>Confirm & Process</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-500" />
                Teacher Process
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
                  <span>Select earnings category and amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
                  <span>Choose payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
                  <span>Upload ID document</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span>
                  <span>Upload signed contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">5</span>
                  <span>SMS verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">6</span>
                  <span>Admin approval required</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                University Process
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
                  <span>Select earnings category and amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
                  <span>Choose payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
                  <span>Upload institution documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span>
                  <span>Upload partnership contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">5</span>
                  <span>Authorized signatory verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">6</span>
                  <span>SMS verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">7</span>
                  <span>Admin approval required</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
