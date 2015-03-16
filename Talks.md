## Changes to JavaScript, Part 1: EcmaScript 5 ##

Speaker: Mark S. Miller (Google, Mountain View, May 2009)

### Abstract ###

Today's JavaScript is a decent language for writing small scale scripts. But even for beginners, it has too many minefields between what beginners learn and what they need to know. And JavaScript is now increasingly used for serious software engineering projects -- straining to carry a load it was not designed for.

After 10 years, the world of JavaScript standards is moving again. The next version, EcmaScript 5, is in "final draft standard" status with implementations about to appear. The "Harmony" agreement sets the direction for future versions beyond EcmaScript 5. The "Secure EcmaScript" working group is working towards an EcmaScript 5 subset suitable for the security needs of inline gadgets, mashups, and more.

In this first talk, we'll explain changes in EcmaScript 5, the problems they're meant to address, the de-facto standards they codify, and how these changes are likely to affect web applications.

### Bio ###

Waldemar Horwat has been involved with JavaScript standardization and implementation since the 1990's when he was working on Netscape's implementation. He is a former editor of the standard and wrote parts of the existing ECMAScript Edition 3 standard. He participates in the ECMA TC39 committee and is the Google representative at the ECMA General Assembly.

Mark S. Miller is a research scientist at Google working on Caja, a member of the EcmaScript committee, open source coordinator for the E programming language, a pioneer of agoric (market-based secure distributed) computing, and an architect of the Xanadu hypertext publishing system.

Mike Samuel is an engineer on Caja and a member of the Secure EcmaScript working group.

<a href='http://www.youtube.com/watch?feature=player_embedded&v=Kq4FpMe6cRs' target='_blank'><img src='http://img.youtube.com/vi/Kq4FpMe6cRs/0.jpg' width='425' height=344 /></a>

[TOC](http://google-caja.googlecode.com/svn/trunk/doc/html/es5-talk/es5-talk.html) | [Slides](http://google-caja.googlecode.com/svn/trunk/doc/html/es5-talk/img0.html)

## Changes to ECMAScript, Part 2: Harmony Highlights - proxies and traits ##

Speaker: Tom Van Cutsem (Google, Mountain View, April 20, 2010)

### Abstract ###

We discuss two proposed language features for inclusion in ECMAScript-Harmony. The first, dynamic proxies, enables Javascript programmers to create proxy objects that can intercept property access, assignment, enumeration, etc. It is a powerful metaprogramming mechanism that provides a standard API for creating generic wrappers for transparent access control, implementing legacy API adaptors, profilers, lazy initialization, etc.

The second part of the talk introduces a traits library for ECMAScript 5. Traits are a more robust alternative to multiple inheritance or mixin-based composition. Based on ECMAScript 5's new "property descriptor" API, we built a portable lightweight library that supports trait-based object composition. We discuss the limitations of introducing traits using a library approach and highlight the benefits of direct support for traits in ECMAScript-Harmony.

### Bio ###

Tom Van Cutsem is a post-doc researcher at the University of Brussels (VUB) in Belgium. His research focus is on programming language design and implementation, with an emphasis on metaprogramming, concurrent and distributed programming. He is co-designer of the distributed scripting language AmbientTalk. Tom is currently on a six-month Visiting Faculty appointment at Google in MTV, cooperating with Mark Miller on Ecmascript-Harmony, the next standard edition of the Javascript programming language.

<a href='http://www.youtube.com/watch?feature=player_embedded&v=A1R8KGKkDjU' target='_blank'><img src='http://img.youtube.com/vi/A1R8KGKkDjU/0.jpg' width='425' height=344 /></a>

[Slides](http://es-lab.googlecode.com/files/harmony_highlights_techtalk.pdf)

The design of the Proxy API is explained in detail in the following [academic paper](http://soft.vub.ac.be/~tvcutsem/proxies/assets/proxies.pdf), to be presented at [DLS 2010](http://www.dynamic-languages-symposium.org/).

## Ephemeron Tables ##

Speaker: Mark S. Miller at EcmaScript committee meeting, May 2010

### Abstract ###

TBD

[Slides](http://es-lab.googlecode.com/files/et.pdf)

## Dr. SES: Distributed Resilient Secure EcmaScript ##

Speaker: Mark S. Miller ([Secure By Design](http://sites.google.com/site/securebydesignworkshop/capabilities-os-session) workshop)

### Abstract ###

TBD

### Bio ###

Mark S. Miller is a research scientist at Google working on Caja, a member of the EcmaScript committee, open source coordinator for the E programming language, a pioneer of agoric (market-based secure distributed) computing, and an architect of the Xanadu hypertext publishing system.

[Slides](http://es-lab.googlecode.com/files/dr-ses.pdf)