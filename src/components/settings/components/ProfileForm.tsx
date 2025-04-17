
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/FormInput";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useTheme } from "next-themes";

interface ProfileFormProps {
  profile: any;
  isLoading: boolean;
  onSubmit: (data: ProfileFormData) => void;
  onPasswordReset: () => void;
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_phone: string;
  location: string;
  language: "en" | "fr";
  theme: "light" | "dark";
}

export function ProfileForm({ profile, isLoading, onSubmit, onPasswordReset }: ProfileFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>();
  const { setTheme } = useTheme();
  const currentTheme = watch("theme") as "light" | "dark";
  const currentLanguage = watch("language");

  useEffect(() => {
    if (profile) {
      setValue("first_name", profile.first_name || "");
      setValue("last_name", profile.last_name || "");
      setValue("email", profile.email || "");
      setValue("phone_number", profile.phone_number || "");
      setValue("mobile_phone", profile.mobile_phone || "");
      setValue("location", profile.location || "");
      setValue("language", profile.language);
      setValue("theme", profile.theme);
    }
  }, [profile, setValue]);

  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, [currentTheme, setTheme]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          placeholder="Enter your first name"
          {...register("first_name")}
        />
        <FormInput
          label="Last Name"
          placeholder="Enter your last name"
          {...register("last_name")}
        />
      </div>

      <div className="relative">
        <FormInput
          label="Email"
          value={profile?.email || ""}
          readOnly
          className="pr-10 bg-muted"
        />
        <Lock className="absolute right-3 top-9 h-4 w-4 text-muted-foreground" />
      </div>

      <FormInput
        label="Phone"
        placeholder="Add a phone number"
        {...register("phone_number")}
      />

      <FormInput
        label="Mobile Phone"
        placeholder="Add a mobile phone number"
        {...register("mobile_phone")}
      />

      <FormInput
        label="Location"
        placeholder="Add your location"
        {...register("location")}
      />

      <div className="space-y-2">
        <Label>Language</Label>
        <RadioGroup
          value={currentLanguage}
          onValueChange={(value) => setValue("language", value as "en" | "fr")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en">English</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fr" id="fr" />
            <Label htmlFor="fr">French</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Theme</Label>
        <RadioGroup
          value={currentTheme}
          onValueChange={(value: "light" | "dark") => {
            setValue("theme", value);
            setTheme(value);
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light">Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark">Dark</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onPasswordReset}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
}
