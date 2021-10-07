import { Flex, Image, Paragraph, Subheading } from '@riftdweb/design-system'
import { Dialog, useDialog } from '@riftdweb/core'
import resolverUrl from './images/resolver.png'
import manageUrl from './images/manage.png'
import txtUrl from './images/txt.png'
import saveUrl from './images/save.png'
import statusUrl from './images/status.png'

export function LearnHow() {
  const dialogProps = useDialog()
  const content = 'Learn how to set up a Handshake domain'
  const triggerElement = 'How does this work with Handshake?'
  return (
    <Dialog
      {...dialogProps}
      content={content}
      triggerElement={triggerElement}
      triggerSize="2"
      triggerVariant="ghost"
    >
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$3',
        }}
      >
        <Subheading>Pointing a Handshake domain to a Skynet website</Subheading>
        <Paragraph css={{ color: '$gray900' }}>
          Setting up a Handshake domain as a Skynet website is easy. All it
          requires is configuring the Handshake domain with a TXT record
          containing a resolver skylink (mutable skylink). The Rift DNS
          interface generates these resolver skylinks for you.
        </Paragraph>
        <Image
          src={resolverUrl}
          alt="resolver skylinks"
          css={{ border: '1px solid $gray400' }}
        />
        <Paragraph css={{ color: '$gray900' }}>
          The resolver skylink will resolve to the current target skylink
          configured in the Rift DNS interface. You can update your Handshake
          website at any time by updating the target skylink - the change will
          take effect immediately.
        </Paragraph>
        <Image
          src={manageUrl}
          alt="manage handshake domain"
          css={{ border: '1px solid $gray400' }}
        />
        <Paragraph css={{ color: '$gray900' }}>
          To set up the Handshake domain, navigate to the domain on Namebase and
          select "Manage".
        </Paragraph>
        <Image
          src={txtUrl}
          alt="set txt record"
          css={{ border: '1px solid $gray400' }}
        />
        <Paragraph css={{ color: '$gray900' }}>
          Create a new TXT record in the "Blockchain DNS records" section. Set
          the value to be the resolver skylink found on the Rift DNS interface.
        </Paragraph>
        <Image
          src={saveUrl}
          alt="save changes"
          css={{ border: '1px solid $gray400' }}
        />
        <Paragraph css={{ color: '$gray900' }}>
          Remember to save the changes, and note the required fees.
        </Paragraph>
        <Image
          src={statusUrl}
          alt="handshake status"
          css={{ border: '1px solid $gray400' }}
        />
        <Paragraph css={{ color: '$gray900' }}>
          This initial setup takes about 10 minutes depending on the Handshake
          blockchain. Once the status indicator at the top of the page turns
          green, the configuration is complete. Note that after this initial
          setup the website can be updated instantly by changing the target
          skylink in the Rift DNS interface.
        </Paragraph>
      </Flex>
    </Dialog>
  )
}
