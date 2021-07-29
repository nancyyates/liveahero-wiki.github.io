# frozen_string_literal: true
require 'json'

module LahWiki
  module JsonParseFilter
    def json_parse(str)
      JSON.parse(str)
    end
  end

  module Skills
    def self.status_wiki(context)
      @@status_wiki ||= context.registers[:site].data["wiki"]["Status"]
    end

    def self.status_master(context)
      @@status_master ||= context.registers[:site].data["StatusMaster"]
    end

    def skill_trigger_json(trigger_s, timing)
      if !trigger_s
        return ""
      end

      triggers = JSON.parse(trigger_s)
      return skill_trigger(triggers, timing)
    end

    def skill_trigger(triggers, timing)
      if !triggers
        return ""
      end

      if triggers.length == 0
        return ""
      end
      f = []

      triggers.each do |c|
        case c["class"]
        when "MinComboTrigger"
          f.push("Combo>=#{c['value']}")
        when "NotPinchExecTrigger"
          f.push("HP&gt;=50<!--#{c['value']}-->%")
        when "PinchExecTrigger"
          f.push("HP&lt;50<!--#{c['value']}-->%")
        when "OwnStatusTrigger"
          status_icon = self.status_description(c['value'])
          f.push("possessing #{status_icon}")
        else
          f.push("unknown condition (#{c['class']}")
        end
      end
      if timing == 1
        return +"(triggered when " + f.join(" and ") + ")"
      else
        return +"(extra_cond: " + f.join(" and ") + ")"
      end
    end

    def status_description(id)
      id_s = id.to_s

      status = Skills::status_master(@context)[id_s]
      if !status
        return "unknown status #{id}"
      end

      wiki_icon = Skills::status_wiki(@context).dig(id_s, 'icon')

      name = Skills::status_wiki(@context).dig(id_s, 'name') || status['statusName']

      "<span class=\"status\" data-id=\"#{id_s}\" title=\"#{status['description']}\"><img src=\"/cdn/Sprite/#{wiki_icon}.png\" loading=\"lazy\"> #{name}</span>"      
    end
  end
end

Liquid::Template.register_filter(LahWiki::JsonParseFilter)
Liquid::Template.register_filter(LahWiki::Skills)
