import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, CheckCircle2, EyeOff } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const PrivacyCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:border-rose-200 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Protected
          </span>
        </div>

        <div className="mb-4">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Privacy Policy
          </span>
          <h3 className="text-2xl font-extrabold text-stone-900 mt-0.5">
            Rules Active
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            Your information-sharing rules are active. Unprompted location broadcasts are strictly suppressed.
          </p>
        </div>

        <div className="space-y-2 mb-6 text-xs text-stone-600">
          <div className="flex items-center justify-between bg-[#fcf8f8] px-3 py-2 rounded-xl border border-stone-200/60">
            <span className="flex items-center gap-1.5 font-medium">
              <EyeOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Normal State Privacy</span>
            </span>
            <span className="text-emerald-700 font-semibold text-[11px]">Strict Hide</span>
          </div>

          <div className="flex items-center justify-between bg-[#fcf8f8] px-3 py-2 rounded-xl border border-stone-200/60">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Crisis Authorization</span>
            </span>
            <span className="text-stone-700 font-semibold text-[11px]">Pre-configured</span>
          </div>
        </div>
      </div>

      <div>
        <Button
          onClick={() => navigate('/privacy')}
          variant="secondary"
          size="sm"
          fullWidth
        >
          <span>Manage Permissions</span>
          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
        </Button>
      </div>
    </Card>
  );
};

export default PrivacyCard;
