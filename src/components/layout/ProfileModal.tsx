import React from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User, Phone, Mail, MapPin, Shield, Calendar, BookOpen, Volume2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const { language, t } = useLanguage();

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? 'ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು' : 'User Profile Details'}
      subtitle={language === 'kn' ? 'ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು ಖಾತೆ ಮಾಹಿತಿ' : 'Village School Digital Identity'}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              logout();
            }}
          >
            {language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Sign Out'}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Avatar and basic info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 text-lg font-bold overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-900">
              {language === 'kn' && user.fullNameKn ? user.fullNameKn : user.fullName}
            </h4>
            <p className="text-xs text-slate-500">@{user.username}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="success" size="sm" dot>
                {role}
              </Badge>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                {language === 'kn' ? 'ಮಾಧ್ಯಮ: ಕನ್ನಡ' : 'Primary Lang: Kannada'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium mb-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {language === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Phone Number'}
            </span>
            <p className="font-semibold text-slate-800">{user.phoneNumber}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium mb-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {language === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
            </span>
            <p className="font-semibold text-slate-800 truncate">{user.email || 'N/A'}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {language === 'kn' ? 'ಗ್ರಾಮ / ಸ್ಥಳ' : 'Village / Location'}
            </span>
            <p className="font-semibold text-slate-800">Hosahalli, Channarayapatna</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium mb-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              {language === 'kn' ? 'ಖಾತೆ ಸುರಕ್ಷತೆ' : 'Account Security'}
            </span>
            <p className="font-semibold text-emerald-700">Phone Verified & Active</p>
          </div>
        </div>

        {/* Rural platform features notice */}
        <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span>
              {language === 'kn' ? 'ಧ್ವನಿ ಕರೆ ಮತ್ತು SMS ಸೌಲಭ್ಯ' : 'Voice SMS & Offline Accessibility'}
            </span>
          </div>
          {language === 'kn'
            ? 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಶಾಲೆಯ ಎಲ್ಲಾ ಪ್ರಮುಖ ಸೂಚನೆಗಳು ಮತ್ತು ಹಾಜರಾತಿ ವಿವರಗಳು ಕನ್ನಡ ಭಾಷೆಯ ಧ್ವನಿ ಸಂದೇಶದ ಮೂಲಕ ರವಾನೆಯಾಗುತ್ತವೆ.'
            : 'All crucial attendance updates, emergency alerts, and meeting invitations will be delivered as Kannada audio calls to this phone number.'}
        </div>
      </div>
    </Modal>
  );
};
