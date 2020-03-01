#!/bin/bash
for filename in ./*; do
    echo $filename
    if [[ $filename == *".png"* ]]
    then
      guetzli --quality 84 $filename $filename
    fi
    echo "ok"
done
