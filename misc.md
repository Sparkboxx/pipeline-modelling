---
layout: page
title: Miscellaneous
parent: Notation
nav_order: 5
---

# Miscellaneous

A couple of other icons have proven to be useful in designing and annotating pipelines.

## User facing app

Data pipelines tend to be a computer only business. However, humans often need to configure or change configurations or peek into the data. For that reason we have a user facing app icon. A square with a diagonal cross inside. It’s easy to draw and not easily confused with the external component and the data sources.
The origin of the symbol lies in wireframing. When wireframing
(web)applications, images are often displayed by a (grey) crossed out rectangle.
And in our experience the majority of user facing applications are still
webpages (as opposed to slack bots, CLIs or desktop software).

{% include diagram.html name="def_misc_user_facing" alt="User Facing App" %}

## Other kinds of systems

A rectangle. If possible with a description of the external system inside the rectangle, and possibly an extra annotation on the label. The example image shows an external Kafka system.
By writing the name of the system in the rectangle you can use the label for an extra annotation. For example the name of the kafka stream.

{% include diagram.html name="def_misc_kafka" alt="Other" %}

## External and internal systems

Sometimes you don't want to go into a system right now: it's a box in the drawing, nothing more. There are two kinds, and the difference is whether you can change it.

- **External system:** a box filled grey. You can't change it: a payment provider, a partner's API, another company's service.
- **Internal system:** a box with one diagonal line. It's yours, and you could change it if you really had to: another team's service, a legacy application, the core platform.

{% include diagram.html name="def_external" alt="External system: a box filled grey" %}
{% include diagram.html name="def_internal" alt="Internal system: a box with one diagonal line" %}

Both need a name. Don't confuse an internal system with a [user facing app](#user-facing-app): that box has a full cross, an internal system has only one diagonal.

## Humans

It’s nice to be able to put some humans in a picture, especially when you add names or roles to the picture.

{% include diagram.html name="def_misc_human" alt="Humans" %}

## Annotations

Sometimes you want to write just a little bit more than a processor or data store name. You can annotate any element in the picture by writing text and using a left and right outer line on a rectangle. Like shown next to this text.  In software packages it is enough just to provide the left and right edge of a box. On the whiteboard it helps to go “just a little around the corner” in order to have the human eye catch the box. 

Why this shape? And why left and right? Because its easy to write your text first and annotate afterwards by drawing a “box without lines” around it. If you want to extend your text you only have to remove the top or bottom 2 small edges.

{% include diagram.html name="def_misc_annotations" alt="Annotations" %}

## Lists and repetitions

Sometimes you run a list of processors in a pipeline that all do the same. For processors this is depicted by overlapping circles, on a whiteboard often drawn as a spiral. Next to the spiral you can optionally list the processors in an annotation box (see [Annotations](#annotations)).

{% include diagram.html name="def_misc_lists" alt="Lists" %}

## Grouping

Sometimes you want to group some items together. To indicate a separate AWS account or VPC, or indicate developer responsibilities. For grouping we use a dashed bounding box with a label attached to it on the outside.

{% include diagram.html name="def_misc_grouping" alt="Grouping" %}

