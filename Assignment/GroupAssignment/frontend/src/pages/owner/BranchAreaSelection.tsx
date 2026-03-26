import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, ArrowRight, Clock, Mail, Phone, ChevronLeft, Building2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useBranchesByRestaurant } from "@/hooks/queries/useBranchQueries";

const BranchAreaSelection = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: branches = [], isLoading } = useBranchesByRestaurant(id || '');

    const activeBranches = branches.filter(b => b.isActive);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/${id}`)}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-display">Select a Branch</h1>
                        <p className="text-sm text-muted-foreground">Choose a branch to manage its areas and tables</p>
                    </div>
                </div>

                {activeBranches.length === 0 ? (
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Active Branches</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                You need to create and activate at least one branch before managing areas and tables.
                            </p>
                            <Button onClick={() => navigate(`/dashboard/${id}`)}>
                                Go to Overview
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeBranches.map((branch) => (
                            <Card
                                key={branch.branchId}
                                className="glass-card border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
                                onClick={() => navigate(`/dashboard/${id}/branches/${branch.branchId}/areas`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ArrowRight className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 min-h-[3.5rem]">
                                        {branch.address}
                                    </h3>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{branch.branchPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{branch.mail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {branch.openingTime.substring(0, 5)} - {branch.closingTime.substring(0, 5)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/${id}/branches/${branch.branchId}/areas`);
                                            }}
                                        >
                                            <span className="text-sm font-medium">Manage Areas & Tables</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Store both branch ID and restaurant ID for branch manager dashboard
                                                localStorage.setItem('selectedBranchId', branch.branchId!);
                                                localStorage.setItem('currentRestaurantId', id!);
                                                navigate('/manager/dashboard');
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium text-primary">Access Branch Dashboard</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-primary" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BranchAreaSelection;
