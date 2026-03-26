import { Card, CardContent } from "@/components/ui/card";
import { Construction, Clock } from "lucide-react";

interface ComingSoonProps {
    title: string;
    description?: string;
}

const ComingSoon = ({ title, description = "This feature is coming soon." }: ComingSoonProps) => {
    return (
        <div className="p-6 lg:p-8">
            <Card className="glass-card border-border/60">
                <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <Construction className="w-12 h-12 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-display">{title}</h2>
                            <p className="text-muted-foreground">{description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Feature under development</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComingSoon;