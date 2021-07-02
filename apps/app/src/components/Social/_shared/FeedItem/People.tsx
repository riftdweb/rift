import {
  Avatar,
  AvatarGroup,
  AvatarNestedItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@riftdweb/design-system'

type Props = {}

export function People({}: Props) {
  return (
    <AvatarGroup>
      <AvatarNestedItem>
        <Avatar
          size="1"
          interactive
          src="https://pbs.twimg.com/profile_images/864164353771229187/Catw6Nmh_400x400.jpg"
          fallback="J"
        />
      </AvatarNestedItem>
      <AvatarNestedItem>
        <Avatar
          size="1"
          interactive
          src="https://pbs.twimg.com/profile_images/864164353771229187/Catw6Nmh_400x400.jpg"
          fallback="J"
        />
      </AvatarNestedItem>
    </AvatarGroup>
  )
}
