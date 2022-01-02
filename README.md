# smeejas
smee operator for kubernetes

what it does: operates on Smee CustomResources.

what its for: want to subscribe to a webhook (e.g. github
push notification) but don't/cant want to expose a webhook port?

head to smee.io (or compatible) and get yourself a smee channel url, 
and then create a Smee resource like you see in examples/ but with your
yourl and pointing to an internal cluste service.

this was written in 4 hours and is a toy project for now.

limitations:
* no support for > 1 concurrent operator pods
* no testing
* no code-quality
* no health checks
* stuff built by hand
* probably got bad bugs

but:
* works for me!
