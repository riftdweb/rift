import { Input } from '@modulz/design-system'

export function Searchbar() {
  return (
    <Input
      css={{ position: 'relative', top: '1px', margin: '0 $3', maxWidth: '400px' }}
      placeholder="Enter Skylink"
      size="3" />
  )
}
