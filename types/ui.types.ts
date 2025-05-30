export interface ButtonProps {
  // required
  to: string

  // optional
  label?: string
  icon?: string
  trailing?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'solid' | 'outline'
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary' | 'neutral'
}
