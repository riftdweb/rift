import {
  Text,
  Flex,
  Image,
  Paragraph,
  Heading,
  Box,
} from '@riftdweb/design-system'
import { Dialog, Link, useDialog } from '@riftdweb/core'
import resolverUrl from './images/resolver.png'
import manageUrl from './images/manage.png'
import txtUrl from './images/txt.png'
import saveUrl from './images/save.png'
import statusUrl from './images/status.png'

export function LearnHow() {
  const dialogProps = useDialog()
  const content = 'Learn how to set up a Handshake domain'
  const triggerElement = 'Learn how to integrate with HNS/ENS/DNSLink'
  return (
    <Dialog
      {...dialogProps}
      content={content}
      triggerElement={triggerElement}
      triggerSize="2"
    >
      <Flex
        css={{
          flexDirection: 'column',
          padding: '$1 0',
          gap: '$3',
        }}
      >
        <Heading size="1">Integrating with DNS solutions</Heading>
        <Paragraph css={{ color: '$gray11' }}>
          The Skynet Labs developer documentation includes excellent guides on
          how to leverage resolver skylinks with HNS, ENS, and DNSLink. For the
          most common HNS/Skynet website setup, refer to the short guide right
          below.
        </Paragraph>
        <Flex css={{ flexDirection: 'column', gap: '$3', marginBottom: '$2' }}>
          <Link
            href={'https://docs.siasky.net/integrations/hns-names'}
            target="_blank"
          >
            Handshake & HNS Names →
          </Link>
          <Link
            href={
              'https://docs.siasky.net/integrations/dnslink-and-domain-names'
            }
            target="_blank"
          >
            DNSLink & Domain Names →
          </Link>
          <Link
            href={
              'https://docs.siasky.net/integrations/ens-ethereum-name-service'
            }
            target="_blank"
          >
            ENS (Ethereum Name Service) →
          </Link>
        </Flex>
        <Box css={{ borderBottom: '1px solid $gray4', margin: '$2 0' }} />
        <Heading size="1" css={{ marginBottom: '$1' }}>
          Common HNS Setup
        </Heading>
        <Text size="4">
          How to point a Handshake domain to a Skynet website
        </Text>
        <Paragraph css={{ color: '$gray11' }}>
          Setting up a Handshake domain as a Skynet website is easy. All it
          requires is configuring the Handshake domain with a TXT record
          containing a resolver skylink (mutable skylink). The Rift DNS
          interface generates these resolver skylinks for you.
        </Paragraph>
        <Image
          src={resolverUrl}
          alt="resolver skylinks"
          css={{ border: '1px solid $gray5' }}
        />
        <Paragraph css={{ color: '$gray11' }}>
          The resolver skylink will resolve to the current target skylink
          configured in the Rift DNS interface. You can update your Handshake
          website at any time by updating the target skylink - the change will
          take effect immediately.
        </Paragraph>
        <Image
          src={manageUrl}
          alt="manage handshake domain"
          css={{ border: '1px solid $gray5' }}
        />
        <Paragraph css={{ color: '$gray11' }}>
          To set up the Handshake domain, navigate to the domain on Namebase and
          select "Manage".
        </Paragraph>
        <Image
          src={txtUrl}
          alt="set txt record"
          css={{ border: '1px solid $gray5' }}
        />
        <Paragraph css={{ color: '$gray11' }}>
          Create a new TXT record in the "Blockchain DNS records" section. Set
          the value to be the resolver skylink found on the Rift DNS interface.
        </Paragraph>
        <Image
          src={saveUrl}
          alt="save changes"
          css={{ border: '1px solid $gray5' }}
        />
        <Paragraph css={{ color: '$gray11' }}>
          Remember to save the changes, and note the required fees.
        </Paragraph>
        <Image
          src={statusUrl}
          alt="handshake status"
          css={{ border: '1px solid $gray5' }}
        />
        <Paragraph css={{ color: '$gray11' }}>
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
