export type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  avatar_url: string | null;
};

export type UserProps = {
  user: User;
  onClose: () => void;
  onSaved: () => void;
};

export type UserEditProps = {
  user: User;
  meId: number;
  onClose: () => void;
  onSaved: () => void;
};
